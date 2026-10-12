import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { Volume2, BookOpen, X, Pencil } from "lucide-react";
import { useLanguage } from "@/lib/i18n";
import { useLanguageScript } from "@/lib/languageScript";
import { supabase } from "@/lib/supabase";

// ⚠️ ПРАВКА ПО КОМПОНОВКЕ ПРАВОЙ ЧАСТИ (эта версия):
// Раньше правая часть была одним полем — только DrawingPad (холст),
// внутри которого сверху была узкая полупрозрачная плашка-проверка
// "буква в выбранной системе письма" (из public.text_letter_writing_systems).
//
// Теперь правая часть — это ТРИ отдельные зоны (flex-col, h-full):
//   1. Верхняя зона  — сам символ буквы (grapheme текущего языка).
//   2. Средняя зона  — тот же символ в выбранной системе письма
//      (значение из public.text_letter_writing_systems по коду script).
//   3. Нижняя зона   — холст для рисования (DrawingPad).
//
// ⚠️ ПРАВКА (пропорции зон): исходно все три зоны были равными
// (flex-1/flex-1/flex-1) — правая колонка не помещалась по высоте и
// появлялся вертикальный скролл. Шаг 1: зоны 1 и 2 уменьшены вдвое
// (flex-[0.5]/flex-[0.5]), а зона 3 увеличена (flex-[2]). Шаг 2: зона 3
// дополнительно уменьшена на 30% (flex-[2] → flex-[1.4]) по прямому
// запросу — скролл при этом мог сохраниться, если его причина не в
// пропорциях внутри колонки, а в том, что суммарная высота колонки
// превышает высоту родительского контейнера (см. компонент страницы
// /game, если проблема не исчезла).
//
// Старая плашка-проверка внутри холста убрана — она дублировала бы
// то, что теперь и так постоянно видно в зонах 1 и 2.
//
// Внутри холста (зона 3) добавлен переключатель "Буква / Письмо" (двумя
// кнопками над самим canvas) — он определяет, какой из двух символов
// сейчас показывается водяным знаком-трафаретом для обводки: сама
// буква (letterSymbol) или её вид в системе письма (scriptSymbol).
// Если для текущей пары (буква, система письма) в
// text_letter_writing_systems нет значения, а режим "Письмо" всё равно
// выбран — вместо трафарета показывается короткая подсказка "нет
// данных", а не пустой холст без объяснения.
//
// ⚠️ ПРАВКА (переименование таблиц): таблицы в Supabase приведены к
// именам, согласованным со схемой проекта Krishna-consciousness (в
// частности text_letter_languages / text_letter_writing_systems /
// text_languages_systems уже используются там для того же назначения):
//   letter_writing_systems  → text_languages_systems
//   letter_anchor           → text_letter_languages
//   letter_text             → text_letter_writing_systems
// Названия СТОЛБЦОВ внутри этих таблиц не менялись — правка коснулась
// только трёх мест ниже, где вызывается supabase.from(...).
//
// ⚠️ ПРАВКА (адаптивная вёрстка / мобильные устройства): на узких
// экранах (< 640px, ниже брейкпоинта sm) три колонки (Functions/
// Categories, таблица букв, панель письма) укладываются в вертикальный
// стек вместо горизонтального ряда, чтобы таблица букв не обрезалась
// и не уезжала за пределы экрана. Порядок на мобильном:
//   1. Functions/Categories (order-1)
//   2. Панель "Буква/Письмо + холст" (order-2)
//   3. Таблица букв (order-3, внизу — по прямому запросу)
// На sm: и выше порядок и ширины возвращаются к исходному горизонтальному
// виду (order сбрасывается через sm:order-*).
//
// ⚠️ ПРАВКА (словарь по букве): верхняя зона правой панели (зона 1 —
// "Буква" + сама буква) теперь КНОПКА. Нажатие открывает окно со
// словами, которые начинаются на выбранную букву; нажатие на слово в
// этом окне озвучивает его (Web Speech API, язык — из SPEECH_LOCALE).
// Слова берутся через GET /api/words?all=true — тот же эндпоинт, что
// используют игры (читает таблицу words; для не-русских языков отдаёт
// ещё и translatedWord из word_translations, параметр &lang=...).
// Озвучивание слова НЕ зависит от переключателя "Озвучивание" слева:
// явный клик по слову — это и есть просьба его услышать.
//
// ⚠️ ПРАВКА (понятность кнопки и трафарета — ЭТА ВЕРСИЯ):
//  1) Зона 1 после выбора буквы выглядит как настоящая кнопка сайта:
//     сплошной золотой фон (как кнопки выбора игры), белая буква и
//     белая «таблетка» с иконкой книги и подписью «Слова на эту букву».
//     Пока человек ни разу не нажал на неё, кнопка мягко «пульсирует»
//     золотым кольцом, привлекая внимание. После первого открытия
//     окна пульсация прекращается (состояние dictHintSeen). Пока буква
//     не выбрана — зона белая, с подсказкой «Сначала выберите букву».
//  2) Большая буква на холсте теперь нарисована как ТРАФАРЕТ:
//     пунктирный контур с бледной заливкой (SVG), а не просто
//     бледная буква. Сверху холста — подсказка с карандашом «Обведите
//     букву пальцем или мышью»; она исчезает, как только человек начал
//     рисовать, и возвращается после «Очистить» или смены буквы.

// ⚠️ ПРАВКА (порядок и подписи двух верхних зон — ЭТА ВЕРСИЯ):
//  • Зоны поменялись местами: сначала (сверху) — буква в выбранной
//    системе письма, ниже — кнопка «Слова на эту букву» с буквой
//    языка.
//  • Верхняя зона теперь трёхстрочная: «Буква» / символ в выбранной
//    системе письма / «В системе письма «Кириллица»» (название берётся
//    из scriptLabel, а не зашито в коде).

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

// Слово из /api/words: word — русское слово из таблицы words,
// translatedWord — его перевод на язык, переданный в параметре lang
// (есть только если запрос был с &lang=... и перевод существует).
interface DictionaryWord {
  id: string;
  word: string;
  translatedWord?: string;
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

// ⚠️ ДОБАВЛЕНО: подписи окна со словами на выбранную букву.
const DICT_TITLE_LABEL: Record<string, string> = {
  ru: 'Слова на букву',
  uk: 'Слова на літеру',
  en: 'Words starting with',
};
const DICT_OPEN_HINT_LABEL: Record<string, string> = {
  ru: 'Показать слова на эту букву',
  uk: 'Показати слова на цю літеру',
  en: 'Show words for this letter',
};
const DICT_LOADING_LABEL: Record<string, string> = {
  ru: 'Загрузка слов...',
  uk: 'Завантаження слів...',
  en: 'Loading words...',
};
const DICT_EMPTY_LABEL: Record<string, string> = {
  ru: 'На эту букву слов пока нет.',
  uk: 'На цю літеру слів поки немає.',
  en: 'No words for this letter yet.',
};
const DICT_ERROR_LABEL: Record<string, string> = {
  ru: 'Не удалось загрузить слова. Закройте окно и попробуйте ещё раз.',
  uk: 'Не вдалося завантажити слова. Закрийте вікно і спробуйте ще раз.',
  en: 'Could not load words. Close this window and try again.',
};
const DICT_HINT_LABEL: Record<string, string> = {
  ru: 'Нажмите на слово, чтобы его услышать',
  uk: 'Натисніть на слово, щоб його почути',
  en: 'Tap a word to hear it',
};
const DICT_CLOSE_LABEL: Record<string, string> = {
  ru: 'Закрыть',
  uk: 'Закрити',
  en: 'Close',
};

// ⚠️ ДОБАВЛЕНО (эта версия): подпись-призыв на кнопке зоны 1, подсказка
// пока буква не выбрана и подсказка над трафаретом на холсте.
const DICT_CTA_LABEL: Record<string, string> = {
  ru: 'Слова на эту букву',
  uk: 'Слова на цю літеру',
  en: 'Words for this letter',
};
const DICT_NEED_LETTER_LABEL: Record<string, string> = {
  ru: 'Сначала выберите букву',
  uk: 'Спочатку виберіть літеру',
  en: 'Pick a letter first',
};
const TRACE_HINT_LABEL: Record<string, string> = {
  ru: 'Обведите букву пальцем или мышью',
  uk: 'Обведіть літеру пальцем або мишею',
  en: 'Trace the letter with finger or mouse',
};

function pickLabel(dict: Record<string, string>, uiLanguage: string): string {
  return dict[uiLanguage] ?? dict.en;
}

// Остановить любое текущее произношение (безопасно, если Web Speech
// API в браузере недоступен).
function stopSpeech() {
  try {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  } catch {
    // ничего страшного — просто нечего останавливать
  }
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
  // public.text_letter_writing_systems, соответствующий коду script) —
  // подтягивается по letter_id выбранной буквы при каждой смене буквы
  // или системы письма.
  const [scriptText, setScriptText] = useState<string | null>(null);

  // ⚠️ ДОБАВЛЕНО: состояние окна со словами на выбранную букву.
  const [dictOpen, setDictOpen] = useState(false);
  const [allWords, setAllWords] = useState<DictionaryWord[]>([]);
  const [wordsLoading, setWordsLoading] = useState(false);
  const [wordsError, setWordsError] = useState(false);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  // ⚠️ ДОБАВЛЕНО (эта версия): true после первого открытия окна со
  // словами — после этого кнопка зоны 1 перестаёт «пульсировать».
  const [dictHintSeen, setDictHintSeen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function fetchLetters() {
      setLoading(true);
      setActiveCategory(null);
      setSelectedId(null);
      // ⚠️ ДОБАВЛЕНО: при смене языка окно со словами закрываем —
      // выбранная буква сбрасывается, а слова были для другого языка.
      setDictOpen(false);
      try {
        const { data: systems, error: sysError } = await supabase
          .from('text_languages_systems')
          .select('id')
          .eq('code', language);

        if (sysError) throw sysError;

        if (systems && systems.length > 0) {
          const systemId = systems[0].id;

          const { data: items, error: itemsError } = await supabase
            .from('text_letter_languages')
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

  // Подтягиваем из public.text_letter_writing_systems значение нужного
  // столбца по letter_id выбранной буквы. Столбец выбирается динамически
  // по коду текущей системы письма (script: 'devanagari' | 'arabic' | ... —
  // те же 12 кодов, что и имена столбцов text_letter_writing_systems, см.
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
          .from('text_letter_writing_systems')
          .select('*')
          .eq('letter_id', selectedLetter.id)
          .maybeSingle();

        if (error) throw error;

        if (!cancelled) {
          const value = data ? (data as any)[script] : null;
          setScriptText(typeof value === 'string' && value.length > 0 ? value : null);
        }
      } catch (err) {
        console.error('Ошибка загрузки транслитерации буквы (text_letter_writing_systems):', err);
        if (!cancelled) setScriptText(null);
      }
    }

    fetchScriptText();
    return () => {
      cancelled = true;
    };
  }, [selectedLetter, script]);

  // ⚠️ ДОБАВЛЕНО: загрузка слов для окна-словаря. Срабатывает при
  // каждом открытии окна (сервер отдаёт /api/words с Cache-Control
  // max-age=120, так что повторные открытия берутся из кэша браузера).
  // Для санскрита слов в базе нет — запрос не делаем.
  useEffect(() => {
    if (!dictOpen) return;
    if (language === 'sa') return;

    let cancelled = false;

    async function loadWords() {
      try {
        const url =
          language === 'ru'
            ? '/api/words?all=true'
            : `/api/words?all=true&lang=${encodeURIComponent(language)}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!cancelled) {
          setAllWords(Array.isArray(data) ? (data as DictionaryWord[]) : []);
          setWordsLoading(false);
        }
      } catch (err) {
        console.error('Ошибка загрузки слов для словаря:', err);
        if (!cancelled) {
          setWordsError(true);
          setWordsLoading(false);
        }
      }
    }

    loadWords();
    return () => {
      cancelled = true;
    };
  }, [dictOpen, language]);

  // Слова, начинающиеся на выбранную букву. Для русского берём
  // words.word, для остальных языков — translatedWord (слова без
  // перевода на текущий язык пропускаем, чтобы не показывать русский
  // текст под, например, английской буквой). Сравнение без учёта
  // регистра; grapheme может быть и из нескольких символов, поэтому
  // используем startsWith, а не сравнение первого символа.
  const letterWords = useMemo(() => {
    if (!selectedLetter) return [] as { id: string; text: string }[];
    const locale = SPEECH_LOCALE[language] ?? 'en-US';
    const target = selectedLetter.grapheme.normalize('NFC').toLocaleLowerCase(locale);
    const result: { id: string; text: string }[] = [];
    for (const w of allWords) {
      const raw = language === 'ru' ? w.word : w.translatedWord;
      if (!raw) continue;
      const text = raw.trim();
      if (text && text.normalize('NFC').toLocaleLowerCase(locale).startsWith(target)) {
        result.push({ id: w.id, text });
      }
    }
    return result.sort((a, b) => a.text.localeCompare(b.text, locale));
  }, [allWords, selectedLetter, language]);

  function openDictionary() {
    if (!selectedLetter) return;
    // Состояние готовим ДО показа окна, чтобы на первом кадре не мелькали
    // слова от прошлого открытия.
    setAllWords([]);
    setWordsError(false);
    setWordsLoading(language !== 'sa');
    setDictOpen(true);
    // ⚠️ ДОБАВЛЕНО: после первого открытия кнопка больше не пульсирует.
    setDictHintSeen(true);
  }

  function closeDictionary() {
    stopSpeech();
    setSpeakingId(null);
    setDictOpen(false);
  }

  // Закрытие окна со словами по Escape.
  useEffect(() => {
    if (!dictOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDictionary();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dictOpen]);

  // При уходе со страницы — остановить недосказанное слово.
  useEffect(() => () => stopSpeech(), []);

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

  // Озвучивание слова из словаря: клик по слову = просьба его услышать,
  // поэтому переключатель "Озвучивание" (audioEnabled) здесь не учитывается.
  function speakWord(id: string, text: string) {
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = SPEECH_LOCALE[language] ?? 'en-US';
      u.rate = 0.8;
      u.onstart = () => setSpeakingId(id);
      u.onend = () => setSpeakingId((cur) => (cur === id ? null : cur));
      u.onerror = () => setSpeakingId((cur) => (cur === id ? null : cur));
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

  // ⚠️ ДОБАВЛЕНО (эта версия): пульсация кнопки зоны 1 — только пока
  // буква выбрана и окно со словами ещё ни разу не открывали.
  const pulseDictButton = Boolean(selectedLetter) && !dictHintSeen;

  return (
    <div className="max-w-7xl mx-auto p-4 h-auto sm:h-full" style={{ backgroundColor: WHITE }}>
      {/* ⚠️ ПРАВКА (мобильная адаптивность): flex-col по умолчанию
          (мобильные, < sm), sm:flex-row — исходный горизонтальный ряд
          на планшетах/десктопе.
          ⚠️ ПРАВКА (высота на мобильном): h-full/items-stretch убраны
          на мобильном (h-auto, items-stretch только с sm:) — иначе
          дочерние блоки в column-раскладке сжимались в жёстко заданную
          высоту родителя, и блоку с буквами (у него был overflow-auto)
          не оставалось видимой высоты. На мобильном страница теперь
          просто растёт по контенту и скроллится целиком браузером. */}
      <div className="flex flex-col sm:flex-row gap-4 sm:items-stretch h-auto sm:h-full">
        {/* ЛЕВАЯ КОЛОНКА — Functions и Categories вместе.
            На мобильном — на всю ширину, order-1 (идёт первой). */}
        <div className="w-full sm:w-40 flex-shrink-0 space-y-4 order-1">
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

        {/* ЦЕНТР — таблица букв.
            ⚠️ ПРАВКА: на мобильном — на всю ширину и order-3 (уходит
            вниз, под панель письма — по прямому запросу "сгруппировать
            снизу"). На sm: и выше — sm:order-2, как в исходной
            раскладке (между левой колонкой и правой панелью). */}
        <div className="w-full sm:flex-1 min-w-0 overflow-visible sm:overflow-auto order-3 sm:order-2">
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

        {/* ПРАВАЯ ЧАСТЬ — три зоны, в стиле кнопок выбора игры (см.
            GameMenu.tsx): rounded-xl, shadow-md, лёгкая hover/tap-
            анимация motion. Палитра — по вашему запросу обратная
            относительно GameMenu (там сплошной золотой фон #FFD700 с
            белыми иконками): здесь белый фон, золотая рамка (2px,
            GOLD_100) и золотые символы/подписи.
            Пропорции по высоте — 0.5 / 0.5 / 1.4: зоны 1 и 2 (буква /
            система письма) компактнее равных долей, зона 3 (холст)
            уменьшена на 30% относительно предыдущей версии (была
            flex-[2]).
            ⚠️ ПРАВКА: на мобильном — на всю ширину, h-auto (высота по
            контенту, а не h-full, иначе flex-[...] зонам нечего было бы
            делить) и order-2 (идёт между сайдбаром и таблицей букв). На
            sm: и выше — исходные w-64/h-full/order-3. */}
        <div className="w-full sm:w-64 flex-shrink-0 h-auto sm:h-full flex flex-col gap-2 order-2 sm:order-3">
          {/* Зона 1 (верхняя) — буква в ВЫБРАННОЙ СИСТЕМЕ ПИСЬМА.
              ⚠️ ПРАВКА (эта версия): зона переехала на первое место
              (раньше была второй) и теперь состоит из трёх строк:
                1) «Буква»;
                2) сам символ буквы в выбранной системе письма
                   (scriptText; «—», если буква не выбрана или для
                   неё нет значения);
                3) «В системе письма «<название системы>»» — название
                   берётся из scriptLabel (колесо «Письменность»), а не
                   зашито в коде, поэтому меняется вместе с выбором
                   системы письма (Кириллица, Деванагари, Латиница …). */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex-[0.5] min-h-[96px] sm:min-h-0 rounded-xl shadow-md flex flex-col items-center justify-center gap-0.5 p-2 overflow-hidden"
            style={{ backgroundColor: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }}
          >
            <span className="block text-[10px] font-bold" style={{ color: GOLD_100 }}>
              {pickLabel(LETTER_ZONE_LABEL, uiLanguage)}
            </span>
            <div
              className="font-bold text-center leading-none break-words"
              style={{ color: GOLD_100, fontSize: 'clamp(20px, 3.4vw, 36px)' }}
            >
              {selectedLetter ? (scriptText ?? '—') : '—'}
            </div>
            <span className="block text-[10px] font-bold text-center leading-tight" style={{ color: GOLD_100 }}>
              {pickLabel(SCRIPT_ZONE_LABEL, uiLanguage)} «{scriptLabel}»
            </span>
          </motion.div>

          {/* Зона 2 (вторая, ниже) — символ буквы + КНОПКА «Слова на эту букву».
              ⚠️ ПРАВКА (эта версия): после выбора буквы зона выглядит
              как кнопка сайта — сплошной золотой фон (как у кнопок
              выбора игры), белая буква и белая «таблетка» с книгой и
              подписью-призывом. Пока человек ни разу не открыл словарь,
              вокруг кнопки мягко расходится золотое кольцо (пульсация).
              Пока буква не выбрана — белая неактивная зона с подсказкой.
              Внутри — span.block (div внутри button — невалидный HTML). */}
          <motion.button
            type="button"
            onClick={openDictionary}
            disabled={!selectedLetter}
            title={pickLabel(DICT_OPEN_HINT_LABEL, uiLanguage)}
            aria-label={pickLabel(DICT_OPEN_HINT_LABEL, uiLanguage)}
            whileHover={selectedLetter ? { scale: 1.04 } : undefined}
            whileTap={selectedLetter ? { scale: 0.96 } : undefined}
            animate={
              pulseDictButton
                ? {
                    boxShadow: [
                      '0 0 0 0 rgba(255, 215, 0, 0.75)',
                      '0 0 0 14px rgba(255, 215, 0, 0)',
                    ],
                  }
                : { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
            }
            transition={
              pulseDictButton
                ? { duration: 1.4, repeat: Infinity, ease: 'easeOut' }
                : { duration: 0.2 }
            }
            className={`relative w-full flex-[0.5] min-h-[96px] sm:min-h-0 rounded-xl shadow-md flex flex-col items-center justify-center gap-0.5 p-2 overflow-hidden ${
              selectedLetter ? 'cursor-pointer' : 'cursor-default'
            }`}
            style={
              selectedLetter
                ? { backgroundColor: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
                : { backgroundColor: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
            }
          >
            <span
              className="block text-[10px] font-bold"
              style={{ color: selectedLetter ? WHITE : GOLD_100 }}
            >
              {pickLabel(LETTER_ZONE_LABEL, uiLanguage)}
            </span>
            <span
              className="block font-bold text-center leading-none break-words"
              style={{
                color: selectedLetter ? WHITE : GOLD_100,
                fontSize: 'clamp(20px, 3.4vw, 36px)',
              }}
            >
              {selectedLetter?.grapheme ?? '—'}
            </span>
            {selectedLetter ? (
              <span
                className="mt-0.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[10px] font-bold"
                style={{ color: GOLD_100 }}
              >
                <BookOpen className="w-3 h-3" strokeWidth={2.5} />
                {pickLabel(DICT_CTA_LABEL, uiLanguage)}
              </span>
            ) : (
              <span className="block text-[10px] font-bold" style={{ color: GOLD_67 }}>
                {pickLabel(DICT_NEED_LETTER_LABEL, uiLanguage)}
              </span>
            )}
          </motion.button>

          {/* Зона 3 — холст для письма от руки. Уменьшена на 30%
              относительно предыдущей версии (flex-[2] → flex-[1.4]).
              min-h на мобильном — та же причина, что у зон 1 и 2. */}
          <div className="flex-[1.4] min-h-[220px] sm:min-h-0">
            <DrawingPad
              letterSymbol={selectedLetter?.grapheme ?? null}
              scriptSymbol={scriptText}
              uiLanguage={uiLanguage}
            />
          </div>
        </div>
      </div>

      {/* ⚠️ ДОБАВЛЕНО: окно со словами на выбранную букву — в стиле
          остальных окон сайта (белый фон, золотая рамка, золотой текст).
          position: fixed, поэтому на раскладку страницы не влияет.
          Клик по затемнению, кнопка ✕ и клавиша Escape закрывают окно. */}
      {dictOpen && selectedLetter && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={closeDictionary} />
          <div
            role="dialog"
            aria-modal="true"
            aria-label={`${pickLabel(DICT_TITLE_LABEL, uiLanguage)} ${selectedLetter.grapheme}`}
            className="fixed top-1/2 left-1/2 w-[92%] max-w-xl max-h-[80vh] bg-white rounded-2xl border-2 shadow-2xl z-[9999] p-4 flex flex-col gap-3"
            style={{ transform: 'translate(-50%, -50%)', borderColor: GOLD_100 }}
          >
            <div className="flex items-center justify-between gap-2 flex-shrink-0">
              <h3 className="text-lg font-bold" style={{ color: GOLD_100 }}>
                {pickLabel(DICT_TITLE_LABEL, uiLanguage)} «{selectedLetter.grapheme}»
              </h3>
              <button
                type="button"
                onClick={closeDictionary}
                aria-label={pickLabel(DICT_CLOSE_LABEL, uiLanguage)}
                title={pickLabel(DICT_CLOSE_LABEL, uiLanguage)}
                className="rounded-full p-1 border-2 bg-white hover:bg-[#FFF2AB] transition-colors"
                style={{ color: GOLD_100, borderColor: GOLD_100 }}
              >
                <X className="w-4 h-4" strokeWidth={3} />
              </button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto">
              {wordsLoading ? (
                <p className="text-sm font-bold" style={{ color: GOLD_100 }}>
                  {pickLabel(DICT_LOADING_LABEL, uiLanguage)}
                </p>
              ) : wordsError ? (
                <p className="text-sm font-bold" style={{ color: GOLD_100 }} role="alert">
                  {pickLabel(DICT_ERROR_LABEL, uiLanguage)}
                </p>
              ) : letterWords.length === 0 ? (
                <p className="text-sm font-bold" style={{ color: GOLD_100 }}>
                  {pickLabel(DICT_EMPTY_LABEL, uiLanguage)}
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {letterWords.map((w) => {
                    const speaking = speakingId === w.id;
                    return (
                      <button
                        key={w.id}
                        type="button"
                        onClick={() => speakWord(w.id, w.text)}
                        className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                          speaking ? '' : 'bg-white hover:bg-[#FFF2AB]'
                        }`}
                        style={
                          speaking
                            ? { backgroundColor: GOLD_100, color: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
                            : { color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }
                        }
                      >
                        <Volume2
                          className="inline-block w-3.5 h-3.5 mr-1 align-text-bottom"
                          strokeWidth={2.5}
                        />
                        {w.text}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <p className="text-[11px] font-bold flex-shrink-0" style={{ color: GOLD_67 }}>
              {pickLabel(DICT_HINT_LABEL, uiLanguage)}
            </p>
          </div>
        </>
      )}
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
// используется как трафарет для обводки. По умолчанию — режим
// "Буква". Смена буквы, системы письма или режима — холст очищается
// (как и раньше при смене буквы).
//
// ⚠️ ПРАВКА (эта версия): трафарет теперь рисуется как SVG-текст с
// ПУНКТИРНЫМ контуром и бледной заливкой — так он выглядит как
// «шаблон для обводки», а не как обычная бледная буква. Над
// трафаретом — подсказка с карандашом «Обведите букву пальцем или
// мышью»; пока человек не начал рисовать, она видна, после первого
// штриха прячется (hasDrawn). «Очистить» или смена буквы/режима
// возвращают подсказку.
interface DrawingPadProps {
  letterSymbol: string | null;
  scriptSymbol: string | null;
  uiLanguage: string;
}

function DrawingPad({ letterSymbol, scriptSymbol, uiLanguage }: DrawingPadProps) {
  const [mode, setMode] = useState<'letter' | 'script'>('letter');
  // ⚠️ ДОБАВЛЕНО: true после первого штриха — прячет подсказку.
  const [hasDrawn, setHasDrawn] = useState(false);
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
    // Подсказка «Обведите букву» возвращается после очистки.
    setHasDrawn(false);
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
    setHasDrawn(true);
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
          // ⚠️ ПРАВКА: трафарет — SVG-текст с пунктирным контуром и
          // бледной заливкой. viewBox 100×100 масштабируется под размер
          // холста (preserveAspectRatio="xMidYMid meet"), поэтому буква
          // всегда целиком помещается. Для длинных значений (3+ символа)
          // шрифт меньше.
          <svg
            className="absolute inset-0 w-full h-full pointer-events-none select-none"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
            aria-hidden="true"
          >
            <text
              x="50"
              y="54"
              textAnchor="middle"
              dominantBaseline="central"
              fontSize={guideSymbol.length > 2 ? 40 : 72}
              fontWeight={900}
              fill={GOLD_33}
              fillOpacity={0.5}
              stroke={GOLD_67}
              strokeWidth={0.8}
              strokeDasharray="2 1.5"
              strokeLinejoin="round"
            >
              {guideSymbol}
            </text>
          </svg>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-4 text-center">
            <p className="text-xs font-bold" style={{ color: GOLD_67 }}>
              {pickLabel(NO_SCRIPT_DATA_LABEL, uiLanguage)}
            </p>
          </div>
        )}

        {/* ⚠️ ДОБАВЛЕНО: подсказка над трафаретом — видна, пока человек
            не начал рисовать. pointer-events-none, чтобы не мешать
            рисованию. */}
        {hasSelection && guideSymbol && !hasDrawn && (
          <div
            className="absolute top-1.5 left-1/2 -translate-x-1/2 max-w-[92%] inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white text-[10px] font-bold text-center leading-tight pointer-events-none select-none"
            style={{ color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_67}` }}
          >
            <Pencil className="w-3 h-3 flex-shrink-0" strokeWidth={2.5} />
            <span>{pickLabel(TRACE_HINT_LABEL, uiLanguage)}</span>
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