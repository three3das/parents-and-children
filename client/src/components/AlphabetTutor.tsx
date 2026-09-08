import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useLanguageScript } from "@/lib/languageScript";
import { supabase } from "@/lib/supabase";

// ⚠️ ПРАВКА ПО КОМПОНОВКЕ ПРАВОЙ ЧАСТИ (эта версия):
// Раньше правая часть была одним полем — только DrawingPad (холст),
// внутри которого сверху была узкая полупрозрачная плашка-проверка
// "буква в выбранной системе письма" (из public.letter_text).
//
// Теперь правая часть — это ТРИ отдельные зоны, РАВНЫЕ по высоте
// (flex-col, h-full, каждая zone flex-1 min-h-0):
//   1. Верхняя зона  — сам символ буквы (grapheme текущего языка).
//   2. Средняя зона  — тот же символ в выбранной системе письма
//      (значение из public.letter_text по коду script).
//   3. Нижняя зона   — холст для рисования (DrawingPad).
//
// Старая плашка-проверка внутри холста убрана — она дублировала бы
// то, что теперь и так постоянно видно в зонах 1 и 2.
//
// Внутри холста (зона 3) добавлен переключатель "Буква / Письмо"
// (двумя кнопками над самим canvas) — он определяет, какой из двух
// символов сейчас показывается водяным знаком-трафаретом для
// обводки: сама буква (letterSymbol) или её вид в системе письма
// (scriptSymbol). Если для текущей пары (буква, система письма) в
// letter_text нет значения, а режим "Письмо" всё равно выбран —
// вместо трафарета показывается короткая подсказка "нет данных",
// а не пустой холст без объяснения.

// Значения посчитаны той же формулой, что и sectorColor() в
// IshvaraPage.tsx: mix(goldPct) = GOLD*goldPct + WHITE*(1-goldPct),
// где GOLD = rgb(255,215,0), WHITE = rgb(255,255,255).
const GOLD_100 = '#FFD700'; // rgb(255,215,0)
const GOLD_67 = '#FFE454';  // rgb(255,228,84)
const GOLD_33 = '#FFF2AB';  // rgb(255,242,171)
const WHITE = '#FFFFFF';

// Единая толщина рамки для всех элементов интерфейса (кнопки, контейнер
// таблицы, ячейки букв, три зоны правой части) — 2px, как было решено
// в предыдущей версии; выбранная буква — 3px.
const BORDER_WIDTH = 2;
const BORDER_WIDTH_SELECTED = 3; // чуть толще — только для выбранной буквы

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
const WRITE_LABEL: Record<string, string> = { ru: 'Напишите символ', uk: 'Напишіть символ', en: 'Write the symbol' };
const CLEAR_LABEL: Record<string, string> = { ru: 'Очистить', uk: 'Очистити', en: 'Clear' };
const PICK_LETTER_LABEL: Record<string, string> = {
  ru: 'Выберите букву слева, чтобы потренироваться её писать',
  uk: 'Виберіть літеру зліва, щоб потренуватися її писати',
  en: 'Pick a letter on the left to practice writing it',
};

// ⚠️ ДОБАВЛЕНО: подписи для двух верхних зон правой панели (буква /
// символ в системе письма) и для переключателя режима внутри холста.
const LETTER_ZONE_LABEL: Record<string, string> = { ru: 'Буква', uk: 'Літера', en: 'Letter' };
const SCRIPT_ZONE_LABEL: Record<string, string> = { ru: 'В системе письма', uk: 'У системі письма', en: 'In writing system' };
const TOGGLE_LETTER_LABEL: Record<string, string> = { ru: 'Буква', uk: 'Буква', en: 'Letter' };
const TOGGLE_SCRIPT_LABEL: Record<string, string> = { ru: 'Письмо', uk: 'Письмо', en: 'Script' };
const NO_SCRIPT_DATA_LABEL: Record<string, string> = {
  ru: 'Нет данных для этой системы письма',
  uk: 'Немає даних для цієї системи письма',
  en: 'No data for this writing system',
};

function pickLabel(dict: Record<string, string>, uiLanguage: string): string {
  return dict[uiLanguage] ?? dict.en;
}

export function AlphabetTutor() {
  const { language } = useLanguage();
  // Текущая выбранная система письма (колесо "Письменность" на
  // IshvaraPage.tsx) — общий контекст, тот же, что используется везде
  // на сайте.
  const { script, scriptLabel } = useLanguageScript();

  const [letters, setLetters] = useState<LetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  // Значение буквы в текущей выбранной системе письма (столбец из
  // public.letter_text, соответствующий коду script) — подтягивается
  // по letter_id выбранной буквы при каждой смене буквы или системы
  // письма.
  const [scriptText, setScriptText] = useState<string | null>(null);

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

  const selectedLetter = useMemo(
    () => letters.find((l) => l.id === selectedId) ?? null,
    [letters, selectedId]
  );

  // Подтягиваем из public.letter_text значение нужного столбца по
  // letter_id выбранной буквы. Столбец выбирается динамически по коду
  // текущей системы письма (script: 'devanagari' | 'arabic' | ... —
  // те же 12 кодов, что и имена столбцов letter_text, см.
  // @/lib/languageScript и SQL-миграцию таблицы).
  useEffect(() => {
    let cancelled = false;

    async function fetchScriptText() {
      if (!selectedLetter) {
        setScriptText(null);
        return;
      }
      try {
        const { data, error } = await supabase
          .from('letter_text')
          .select('*')
          .eq('letter_id', selectedLetter.id)
          .maybeSingle();

        if (error) throw error;

        if (!cancelled) {
          const value = data ? (data as any)[script] : null;
          setScriptText(typeof value === 'string' && value.length > 0 ? value : null);
        }
      } catch (err) {
        console.error('Ошибка загрузки транслитерации буквы (letter_text):', err);
        if (!cancelled) setScriptText(null);
      }
    }

    fetchScriptText();
    return () => {
      cancelled = true;
    };
  }, [selectedLetter, script]);

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
        <p className="text-sm font-bold" style={{ color: GOLD_100 }}>{pickLabel(LOADING_LABEL, uiLanguage)}</p>
      </div>
    );
  }

  if (letters.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <p className="text-sm font-bold" style={{ color: GOLD_100 }}>{pickLabel(NO_DATA_LABEL, uiLanguage)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 h-full" style={{ backgroundColor: WHITE }}>
      <div className="flex gap-4 items-stretch h-full">
        {/* ЛЕВАЯ КОЛОНКА — Functions и Categories вместе. */}
        <div className="w-40 flex-shrink-0 space-y-4">
          <div>
            <h4 className="text-[10px] font-bold mb-1" style={{ color: GOLD_100 }}>
              {pickLabel(FUNCTIONS_LABEL, uiLanguage)}
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="w-full text-left px-2 py-1 rounded text-xs font-bold transition-colors"
                style={
                  audioEnabled
                    ? { backgroundColor: GOLD_100, color: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
                    : { backgroundColor: WHITE, color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }
                }
                onMouseEnter={(e) => {
                  if (!audioEnabled) e.currentTarget.style.backgroundColor = GOLD_33;
                }}
                onMouseLeave={(e) => {
                  if (!audioEnabled) e.currentTarget.style.backgroundColor = WHITE;
                }}
              >
                <Volume2
                  className="inline-block w-3.5 h-3.5 mr-1 align-text-bottom"
                  style={{ color: audioEnabled ? WHITE : GOLD_100 }}
                  strokeWidth={2.5}
                />
                {pickLabel(AUDIO_LABEL, uiLanguage)}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold mb-1" style={{ color: GOLD_100 }}>
              {pickLabel(CATEGORIES_LABEL, uiLanguage)}
            </h4>
            <div className="space-y-0.5">
              {groups.map((group) => {
                const isActive = activeCategory === group.type;
                return (
                  <button
                    key={group.type}
                    onClick={() => handleCategoryClick(group.type)}
                    className="w-full text-left px-2 py-1 rounded text-xs font-bold transition-colors"
                    style={
                      isActive
                        ? { backgroundColor: GOLD_67, color: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_67}` }
                        : { backgroundColor: WHITE, color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = GOLD_33;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = WHITE;
                    }}
                  >
                    {getGroupLabel(group.type, uiLanguage)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ЦЕНТР — таблица букв. */}
        <div className="flex-1 min-w-0 overflow-auto">
          <div
            className="p-3 rounded space-y-2"
            style={{ backgroundColor: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }}
          >
            {groups.map((group) => (
              <div key={group.type}>
                <h3 className="text-xs font-bold mb-1" style={{ color: GOLD_100 }}>
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

        {/* ПРАВАЯ ЧАСТЬ — три зоны равной высоты, в стиле кнопок выбора
            игры (см. GameMenu.tsx): rounded-xl, shadow-md, лёгкая
            hover/tap-анимация motion. Палитра — по вашему запросу
            обратная относительно GameMenu (там сплошной золотой фон
            #FFD700 с белыми иконками): здесь белый фон, золотая рамка
            (2px, GOLD_100) и золотые символы/подписи. Зоны делят
            правую колонку на три равные по высоте "кнопки"
            (flex-1 min-h-0 у каждой). */}
        <div className="w-64 flex-shrink-0 h-full flex flex-col gap-2">
          {/* Зона 1 — символ буквы. */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 min-h-0 rounded-xl shadow-md flex flex-col items-center justify-center p-2 overflow-hidden"
            style={{ backgroundColor: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }}
          >
            <h4 className="text-[10px] font-bold mb-1" style={{ color: GOLD_100 }}>
              {pickLabel(LETTER_ZONE_LABEL, uiLanguage)}
            </h4>
            <div
              className="font-bold text-center leading-none break-words"
              style={{ color: GOLD_100, fontSize: 'clamp(28px, 6vw, 56px)' }}
            >
              {selectedLetter?.grapheme ?? '—'}
            </div>
          </motion.div>

          {/* Зона 2 — тот же символ в выбранной системе письма. */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-1 min-h-0 rounded-xl shadow-md flex flex-col items-center justify-center p-2 overflow-hidden"
            style={{ backgroundColor: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }}
          >
            <h4 className="text-[10px] font-bold mb-1 text-center" style={{ color: GOLD_100 }}>
              {pickLabel(SCRIPT_ZONE_LABEL, uiLanguage)} «{scriptLabel}»
            </h4>
            <div
              className="font-bold text-center leading-none break-words"
              style={{ color: GOLD_100, fontSize: 'clamp(28px, 6vw, 56px)' }}
            >
              {selectedLetter ? (scriptText ?? '—') : '—'}
            </div>
          </motion.div>

          {/* Зона 3 — холст для письма от руки. */}
          <div className="flex-1 min-h-0">
            <DrawingPad
              letterSymbol={selectedLetter?.grapheme ?? null}
              scriptSymbol={scriptText}
              uiLanguage={uiLanguage}
            />
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
  // Различие состояний передаётся только четырьмя разрешёнными цветами
  // (плюс толщина рамки), без введения синего/жёлтого/серого:
  //   - выбранная буква (клик) — инвертированные цвета: фон "золото
  //     100%", текст белый — самая заметная ячейка;
  //   - буква из активной категории — светлый золотой фон (33%) с
  //     более тёмной золотой рамкой (67%);
  //   - обычная ячейка — белый фон, тонкая светло-золотая рамка (33%),
  //     золотой (100%) текст буквы.
  const background = isSelected ? GOLD_100 : isHighlighted ? GOLD_33 : WHITE;
  const textColor = isSelected ? WHITE : GOLD_100;
  const borderColor = isSelected ? GOLD_100 : isHighlighted ? GOLD_67 : GOLD_33;
  const borderWidth = isSelected ? BORDER_WIDTH_SELECTED : BORDER_WIDTH;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative w-10 h-10 flex flex-col items-center justify-center transition-colors flex-shrink-0"
      style={{
        backgroundColor: background,
        border: `${borderWidth}px solid ${borderColor}`,
      }}
    >
      {letter.sort_order != null && (
        <div
          className="absolute top-0 right-0 text-[7px] font-bold px-0.5 leading-none"
          style={{ color: textColor }}
        >
          {letter.sort_order}
        </div>
      )}
      <div className="text-sm font-bold" style={{ color: textColor }}>
        {letter.grapheme}
      </div>
    </motion.button>
  );
}

// --- Поле для письма от руки ---
//
// Рисование через Pointer Events (onPointerDown/Move/Up/Leave) — один
// и тот же обработчик одинаково получает события и от мыши на
// ноутбуке, и от пальца на сенсорном телефоне/планшете, и от стилуса
// (например, Apple Pencil, S Pen) — браузер сам разруливает источник
// события, поэтому отдельно ловить touch-события не требуется.
//
// touch-action: none на canvas обязателен — без него при рисовании
// пальцем на сенсорном экране страница начнёт скроллиться/зумиться
// вместо того, чтобы рисовать линию.
//
// ⚠️ ДОБАВЛЕНО: переключатель режима "Буква / Письмо" (две кнопки над
// холстом) — определяет, letterSymbol или scriptSymbol сейчас
// используется как трафарет-водяной знак для обводки. По умолчанию —
// режим "Буква". Смена буквы, системы письма или режима — холст
// очищается (как и раньше при смене буквы).
interface DrawingPadProps {
  letterSymbol: string | null;
  scriptSymbol: string | null;
  uiLanguage: string;
}

function DrawingPad({ letterSymbol, scriptSymbol, uiLanguage }: DrawingPadProps) {
  const [mode, setMode] = useState<'letter' | 'script'>('letter');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  const hasSelection = Boolean(letterSymbol);
  const guideSymbol = mode === 'letter' ? letterSymbol : scriptSymbol;

  useEffect(() => {
    function setupCanvas() {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = GOLD_100;
        ctx.lineWidth = 5;
      }
    }

    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, []);

  useEffect(() => {
    clearCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideSymbol]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getRelativePoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = getRelativePoint(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const point = getRelativePoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  }

  function handlePointerUp() {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Переключатель "Буква / Письмо" — над холстом. */}
      <div className="flex gap-1 mb-1 flex-shrink-0">
        <button
          onClick={() => setMode('letter')}
          className="flex-1 px-2 py-1 rounded text-[10px] font-bold transition-colors"
          style={
            mode === 'letter'
              ? { backgroundColor: GOLD_100, color: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
              : { backgroundColor: WHITE, color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }
          }
          onMouseEnter={(e) => {
            if (mode !== 'letter') e.currentTarget.style.backgroundColor = GOLD_33;
          }}
          onMouseLeave={(e) => {
            if (mode !== 'letter') e.currentTarget.style.backgroundColor = WHITE;
          }}
        >
          {pickLabel(TOGGLE_LETTER_LABEL, uiLanguage)}
        </button>
        <button
          onClick={() => setMode('script')}
          className="flex-1 px-2 py-1 rounded text-[10px] font-bold transition-colors"
          style={
            mode === 'script'
              ? { backgroundColor: GOLD_100, color: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
              : { backgroundColor: WHITE, color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }
          }
          onMouseEnter={(e) => {
            if (mode !== 'script') e.currentTarget.style.backgroundColor = GOLD_33;
          }}
          onMouseLeave={(e) => {
            if (mode !== 'script') e.currentTarget.style.backgroundColor = WHITE;
          }}
        >
          {pickLabel(TOGGLE_SCRIPT_LABEL, uiLanguage)}
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative flex-1 min-h-0 rounded-xl shadow-md overflow-hidden"
        style={{ touchAction: 'none', minHeight: '90px', backgroundColor: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }}
      >
        {!hasSelection ? (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-4 text-center">
            <p className="text-xs font-bold" style={{ color: GOLD_67 }}>
              {pickLabel(PICK_LETTER_LABEL, uiLanguage)}
            </p>
          </div>
        ) : guideSymbol ? (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ fontSize: 'min(30vw, 220px)', color: GOLD_33, fontWeight: 900 }}
          >
            {guideSymbol}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-4 text-center">
            <p className="text-xs font-bold" style={{ color: GOLD_67 }}>
              {pickLabel(NO_SCRIPT_DATA_LABEL, uiLanguage)}
            </p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      <div className="flex items-center justify-between mt-1 flex-shrink-0">
        <h4 className="text-[10px] font-bold" style={{ color: GOLD_100 }}>
          {pickLabel(WRITE_LABEL, uiLanguage)}
        </h4>
        <button
          onClick={clearCanvas}
          className="px-2 py-1 rounded text-xs font-bold transition-colors"
          style={{ backgroundColor: WHITE, color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = GOLD_33;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = WHITE;
          }}
        >
          {pickLabel(CLEAR_LABEL, uiLanguage)}
        </button>
      </div>
    </div>
  );
}