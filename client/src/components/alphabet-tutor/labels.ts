// Переводы интерфейса: ru, uk, en. Остальные языки — запасной en.
type Dict = Record<string, string>;

export function pickLabel(dict: Dict, uiLanguage: string): string {
  return dict[uiLanguage] ?? dict.en;
}

const GROUP_LABELS: Record<string, Dict> = {
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

export function getGroupLabel(letterType: string, uiLanguage: string): string {
  const entry = GROUP_LABELS[letterType.toLowerCase()];
  if (entry) return entry[uiLanguage] ?? entry.en;
  return letterType.charAt(0).toUpperCase() + letterType.slice(1);
}

export const L = {
  functions: { ru: 'Функции', uk: 'Функції', en: 'Functions' },
  audio: { ru: 'Озвучивание', uk: 'Озвучування', en: 'Audio' },
  categories: { ru: 'Категории', uk: 'Категорії', en: 'Categories' },
  // Только для санскрита: отдельная панель для изучения грамматики.
  samjnaPrakaranam: {
    ru: 'Хари-намамрита-вьякарана',
    uk: 'Харі-намамріта-вьякарана',
    en: 'Hari-namamrita-vyakarana',
    sa: 'हरि-नमृत-व्याकरणम्',
  },
  backToCategories: { ru: '← Назад', uk: '← Назад', en: '← Back' },
  loading: { ru: 'Загрузка алфавита...', uk: 'Завантаження алфавіту...', en: 'Loading alphabet...' },
  noData: {
    ru: 'Для данного языка пока нет букв в базе данных.',
    uk: 'Для цієї мови поки немає літер у базі даних.',
    en: 'No letters available for this language yet.',
  },
  write: { ru: 'Напишите символ', uk: 'Напишіть символ', en: 'Write the symbol' },
  clear: { ru: 'Очистить', uk: 'Очистити', en: 'Clear' },
  pickLetter: {
    ru: 'Выберите букву слева, чтобы потренироваться её писать',
    uk: 'Виберіть літеру зліва, щоб потренуватися її писати',
    en: 'Pick a letter on the left to practice writing it',
  },
  letterZone: { ru: 'Буква', uk: 'Літера', en: 'Letter' },
  scriptZone: { ru: 'В системе письма', uk: 'У системі письма', en: 'In writing system' },
  toggleLetter: { ru: 'Буква', uk: 'Буква', en: 'Letter' },
  toggleScript: { ru: 'Письмо', uk: 'Письмо', en: 'Script' },
  noScriptData: {
    ru: 'Нет данных для этой системы письма',
    uk: 'Немає даних для цієї системи письма',
    en: 'No data for this writing system',
  },
  traceHint: {
    ru: 'Обведите букву пальцем или мышью',
    uk: 'Обведіть літеру пальцем або мишею',
    en: 'Trace the letter with finger or mouse',
  },
  // Словарь
  dictTitle: { ru: 'Слова на букву', uk: 'Слова на літеру', en: 'Words starting with' },
  dictOpenHint: {
    ru: 'Показать слова на эту букву',
    uk: 'Показати слова на цю літеру',
    en: 'Show words for this letter',
  },
  dictCta: { ru: 'Слова на эту букву', uk: 'Слова на цю літеру', en: 'Words for this letter' },
  dictNeedLetter: { ru: 'Сначала выберите букву', uk: 'Спочатку виберіть літеру', en: 'Pick a letter first' },
  dictLoading: { ru: 'Загрузка слов...', uk: 'Завантаження слів...', en: 'Loading words...' },
  dictEmpty: {
    ru: 'На эту букву слов пока нет.',
    uk: 'На цю літеру слів поки немає.',
    en: 'No words for this letter yet.',
  },
  dictError: {
    ru: 'Не удалось загрузить слова. Закройте окно и попробуйте ещё раз.',
    uk: 'Не вдалося завантажити слова. Закрийте вікно і спробуйте ще раз.',
    en: 'Could not load words. Close this window and try again.',
  },
  dictHint: {
    ru: 'Нажмите на слово, чтобы его услышать',
    uk: 'Натисніть на слово, щоб його почути',
    en: 'Tap a word to hear it',
  },
  close: { ru: 'Закрыть', uk: 'Закрити', en: 'Close' },
} satisfies Record<string, Dict>;