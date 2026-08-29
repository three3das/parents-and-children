import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

// ⚠️ ПОЛНАЯ ПЕРЕДЕЛКА: раньше этот компонент брал буквы из захардкоженных
// локальных файлов (@/lib/sanskritAlphabet, @/lib/cyrillicAlphabet) и
// поддерживал только 4 языка (sa, ru, uk, en) — для остальных 8 языков
// (ar, bn, id, es, pt, ur, fr, hi) в switch был default, откатывавший
// показ обратно на санскрит. Теперь буквы загружаются из Supabase
// (таблицы public.letter_writing_systems + public.letter_anchor) — так
// же, как это уже сделано в AlphabetPage.tsx, — и работают для любого
// из всех 12 языков сайта, при условии что для него заполнены строки
// в letter_anchor.
//
// ⚠️ В letter_anchor нет колонки с произношением/транслитерацией —
// только grapheme, letter_type, sort_order. Поэтому:
//   - группы букв ("Гласные"/"Согласные"/...) строятся ДИНАМИЧЕСКИ по
//     всем значениям letter_type, реально встретившимся у данного
//     языка (в порядке их первого появления по sort_order), а не по
//     фиксированному списку категорий, как было раньше для санскрита;
//   - всплывающая подсказка с произношением убрана — этих данных в
//     таблице просто нет. Озвучка по клику работает через
//     speechSynthesis (Web Speech API), как в AlphabetPage.tsx.

interface LetterRow {
  id: string;
  grapheme: string;
  letter_type: string | null;
  sort_order: number | null;
}

interface LetterGroup {
  type: string;
  letters: LetterRow[];
}

// Голосовой локаль для озвучки — свой для каждого из 12 языков сайта.
const SPEECH_LOCALE: Record<string, string> = {
  sa: 'hi-IN', // отдельного голоса для санскрита в браузерах обычно нет
  en: 'en-US',
  ar: 'ar-SA',
  bn: 'bn-IN',
  id: 'id-ID',
  es: 'es-ES',
  pt: 'pt-PT',
  ru: 'ru-RU',
  uk: 'uk-UA',
  ur: 'ur-PK',
  fr: 'fr-FR',
  hi: 'hi-IN',
};

// Подписи групп букв — переведены для языков интерфейса, где уже есть
// полный перевод (ru, uk, en); для остальных языков интерфейса, пока
// для них нет отдельного перевода UI (см. lib/i18n/translations.ts),
// используется английский вариант как запасной. Значения letter_type,
// которых нет в этом словаре, показываются как есть (с заглавной буквы).
const GROUP_LABELS: Record<string, Record<string, string>> = {
  vowel: { ru: 'Гласные', uk: 'Голосні', en: 'Vowels' },
  consonant: { ru: 'Согласные', uk: 'Приголосні', en: 'Consonants' },
  semivowel: { ru: 'Полугласные', uk: 'Напівголосні', en: 'Semivowels' },
  sibilant: { ru: 'Шипящие', uk: 'Шиплячі', en: 'Sibilants' },
  aspirate: { ru: 'Придыхательные', uk: 'Придихові', en: 'Aspirates' },
  guttural: { ru: 'Гортанные', uk: 'Горлові', en: 'Gutturals' },
  palatal: { ru: 'Нёбные', uk: 'Піднебінні', en: 'Palatals' },
  retroflex: { ru: 'Церебральные', uk: 'Церебральні', en: 'Retroflexes' },
  dental: { ru: 'Зубные', uk: 'Зубні', en: 'Dentals' },
  labial: { ru: 'Губные', uk: 'Губні', en: 'Labials' },
  numeral: { ru: 'Цифры', uk: 'Цифри', en: 'Numerals' },
  diacritic: { ru: 'Диакритика', uk: 'Діакритика', en: 'Diacritics' },
  special: { ru: 'Специальные знаки', uk: 'Спеціальні знаки', en: 'Special characters' },
  extra: { ru: 'Дополнительные', uk: 'Додаткові', en: 'Extra' },
};

function getGroupLabel(letterType: string, uiLanguage: string): string {
  const entry = GROUP_LABELS[letterType.toLowerCase()];
  if (entry) {
    return entry[uiLanguage] ?? entry.en;
  }
  // Неизвестный тип — показываем как есть, с заглавной буквы.
  return letterType.charAt(0).toUpperCase() + letterType.slice(1);
}

const FUNCTIONS_LABEL: Record<string, string> = { ru: 'Функции', uk: 'Функції', en: 'Functions' };
const AUDIO_LABEL: Record<string, string> = { ru: 'Озвучивание', uk: 'Озвучування', en: 'Audio' };
const CATEGORIES_LABEL: Record<string, string> = { ru: 'Категории', uk: 'Категорії', en: 'Categories' };
const LOADING_LABEL: Record<string, string> = { ru: 'Загрузка алфавита...', uk: 'Завантаження алфавіту...', en: 'Loading alphabet...' };
const NO_DATA_LABEL: Record<string, string> = {
  ru: 'Для данного языка пока нет букв в базе данных.',
  uk: 'Для цієї мови поки немає літер у базі даних.',
  en: 'No letters available for this language yet.',
};

function pickLabel(dict: Record<string, string>, uiLanguage: string): string {
  return dict[uiLanguage] ?? dict.en;
}

export function AlphabetTutor() {
  const { language } = useLanguage();

  const [letters, setLetters] = useState<LetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // Загрузка букв текущего языка из Supabase — та же логика, что и в
  // AlphabetPage.tsx: сначала находим id системы письменности по коду
  // языка, затем берём все буквы этой системы, отсортированные по
  // sort_order.
  useEffect(() => {
    let cancelled = false;

    async function fetchLetters() {
      setLoading(true);
      setActiveCategory(null);
      setSelectedId(null);
      try {
        const { data: systems, error: sysError } = await supabase
          .from('letter_writing_systems')
          .select('id')
          .eq('code', language);

        if (sysError) throw sysError;

        if (systems && systems.length > 0) {
          const systemId = systems[0].id;

          const { data: items, error: itemsError } = await supabase
            .from('letter_anchor')
            .select('*')
            .eq('language_id', systemId)
            .order('sort_order', { ascending: true });

          if (itemsError) throw itemsError;

          if (!cancelled) {
            setLetters(items || []);
          }
        } else if (!cancelled) {
          setLetters([]);
        }
      } catch (err) {
        console.error("Ошибка загрузки алфавита из базы данных:", err);
        if (!cancelled) setLetters([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLetters();
    return () => {
      cancelled = true;
    };
  }, [language]);

  // Группировка букв по letter_type, в порядке первого появления
  // (т.е. в том порядке, в котором группы встречаются при движении по
  // sort_order) — так порядок групп остаётся стабильным и предсказуемым
  // независимо от того, какие именно типы букв есть у данного языка.
  const groups: LetterGroup[] = useMemo(() => {
    const order: string[] = [];
    const byType = new Map<string, LetterRow[]>();
    for (const letter of letters) {
      const type = letter.letter_type || 'other';
      if (!byType.has(type)) {
        byType.set(type, []);
        order.push(type);
      }
      byType.get(type)!.push(letter);
    }
    return order.map((type) => ({ type, letters: byType.get(type)! }));
  }, [letters]);

  // UI-язык для подписей групп/панелей — переводы есть только для
  // ru/uk/en, для остальных 8 языков используем английский текст как
  // запасной вариант (полноценный перевод интерфейса на них — отдельная
  // задача, см. lib/i18n/translations.ts).
  const uiLanguage = ['ru', 'uk', 'en'].includes(language) ? language : 'en';

  function playLetter(grapheme: string) {
    if (!audioEnabled) return;
    try {
      const u = new SpeechSynthesisUtterance(grapheme);
      u.lang = SPEECH_LOCALE[language] ?? 'en-US';
      u.rate = 0.7;
      speechSynthesis.speak(u);
    } catch (e) {
      console.error(e);
    }
  }

  function handleLetterClick(letter: LetterRow) {
    setSelectedId(letter.id);
    playLetter(letter.grapheme);
  }

  function handleCategoryClick(type: string) {
    setActiveCategory((prev) => (prev === type ? null : type));
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <p className="text-sm text-[#FFD700] font-bold">{pickLabel(LOADING_LABEL, uiLanguage)}</p>
      </div>
    );
  }

  if (letters.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <p className="text-sm text-[#FFD700] font-bold">{pickLabel(NO_DATA_LABEL, uiLanguage)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex gap-4">
        {/* Left side - Function controls */}
        <div className="w-40 space-y-2">
          <div>
            <h4 className="text-[10px] text-[#FFD700] font-bold mb-1">
              {pickLabel(FUNCTIONS_LABEL, uiLanguage)}
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${audioEnabled ? 'bg-green-400 text-[#FFD700] font-bold' : 'bg-gray-200 text-[#FFD700] font-bold hover:bg-gray-300'}`}
              >
                🔊 {pickLabel(AUDIO_LABEL, uiLanguage)}
              </button>
            </div>
          </div>
        </div>

        {/* Center - Alphabet Table */}
        <div className="flex-1">
          <div className="bg-gray-200 p-3 rounded space-y-3">
            {groups.map((group) => (
              <div key={group.type}>
                <h3 className="text-xs text-[#FFD700] font-bold mb-1">
                  {getGroupLabel(group.type, uiLanguage)}
                </h3>
                <div className="flex gap-0.5 justify-start flex-wrap">
                  {group.letters.map((letter) => (
                    <LetterCard
                      key={letter.id}
                      letter={letter}
                      isHighlighted={activeCategory === group.type}
                      isSelected={selectedId === letter.id}
                      isHovered={hoveredId === letter.id}
                      onClick={() => handleLetterClick(letter)}
                      onMouseEnter={() => setHoveredId(letter.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right side - Category filters */}
        <div className="w-40 space-y-2">
          <div>
            <h4 className="text-[10px] text-[#FFD700] font-bold mb-1">
              {pickLabel(CATEGORIES_LABEL, uiLanguage)}
            </h4>
            <div className="space-y-0.5">
              {groups.map((group) => (
                <button
                  key={group.type}
                  onClick={() => handleCategoryClick(group.type)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${activeCategory === group.type ? 'bg-yellow-400 text-[#FFD700] font-bold' : 'bg-gray-200 text-[#FFD700] font-bold hover:bg-gray-300'}`}
                >
                  {getGroupLabel(group.type, uiLanguage)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface LetterCardProps {
  letter: LetterRow;
  isHighlighted: boolean;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function LetterCard({
  letter,
  isHighlighted,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: LetterCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative w-14 h-14 border flex flex-col items-center justify-center transition-colors flex-shrink-0 ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : isHighlighted
          ? 'border-yellow-500 bg-yellow-50'
          : 'border-gray-300 bg-white hover:bg-gray-50'
      }`}
    >
      {letter.sort_order != null && (
        <div className="absolute top-0 right-0 text-[8px] text-[#FFD700] font-bold px-0.5">
          {letter.sort_order}
        </div>
      )}
      <div className="text-xl text-[#FFD700] font-bold">
        {letter.grapheme}
      </div>
    </motion.button>
  );
}