// ─── Shared category data ────────────────────────────────────────────────────
// One entry per home-page button. Each category defines:
//   • its home-button appearance  (gradient, shadow, emoji, label)
//   • its page background         (bgGradient)
//   • its 7 sub-icons             (shown in the icon-row on the category page)

export interface SubIcon {
  gradient: string;
  shadow: string;
  emoji: string;
  label: string;
  images?: Partial<Record<string, string>>; // per-language image (overrides emoji) — не у каждого языка обязательно есть картинка
  path?: string; // navigation path on click
}

export interface Category {
  id: string;
  path: string;
  emoji: string;
  label: string;
  text?: Partial<Record<string, string>>; // multilingual label on home button — не у каждого языка обязательно есть перевод
  image?: string;     // optional image path (replaces emoji on home button)
  images?: Partial<Record<string, string>>; // per-language images
  gradient: string;   // home button gradient
  shadow: string;     // home button shadow
  bgGradient: string; // category page background
  subIcons: SubIcon[];
}

// ── Shared golden palette for sub-icon buttons ───────────────────────────────
// ⚠️ ПРАВКА ПО ЦВЕТУ: раньше здесь была радужная палитра (7 разных цветов —
// красный/оранжевый/жёлтый/зелёный/синий/фиолетовый/пурпурный) для кнопок
// в ряду суб-иконок на странице категории. Теперь все 7 записей — в одной
// золотой гамме (тот же оттенок, что и в остальном интерфейсе — GOLD_100 =
// #FFD700), с небольшим перепадом яркости между записями (от светло-золотого
// до более тёмного янтарного), чтобы кнопки не сливались в абсолютно
// одинаковое плоское пятно, но при этом визуально читались как единый
// золотой набор, а не как радуга.
const R = [
  { gradient: "linear-gradient(140deg, #FFE066, #FFC700)", shadow: "rgba(230,180,0,0.40)" },
  { gradient: "linear-gradient(140deg, #FFDA44, #F5B800)", shadow: "rgba(220,170,0,0.40)" },
  { gradient: "linear-gradient(140deg, #FFD700, #E6A800)", shadow: "rgba(210,150,0,0.40)" },
  { gradient: "linear-gradient(140deg, #FDC830, #D89A00)", shadow: "rgba(190,130,0,0.40)" },
  { gradient: "linear-gradient(140deg, #F5BE41, #CC8E00)", shadow: "rgba(180,120,0,0.40)" },
  { gradient: "linear-gradient(140deg, #E8AC32, #B87A00)", shadow: "rgba(160,105,0,0.40)" },
  { gradient: "linear-gradient(140deg, #D99A1E, #A66600)", shadow: "rgba(140,90,0,0.40)"  },
];

const sub = (emojis: string[], labels: string[]): SubIcon[] =>
  emojis.map((emoji, i) => ({ ...R[i], emoji, label: labels[i] }));

// ── Category definitions (order = home-page button order) ────────────────────
export const CATEGORIES: Category[] = [
  {
    id: "reading",
    path: "/game",
    emoji: "📖",
    label: "Чтение",
    text: { ru: "Язык", en: "Language", uk: "Мова", sa: "भाषा (Bhāṣā)" },
    image: "/images/om_symbol.png",
    gradient: "linear-gradient(140deg, #FF5252, #E00000)",
    shadow: "rgba(220,0,0,0.40)",
    bgGradient: "linear-gradient(160deg, #FF6B6B 0%, #FF2222 55%, #C00000 100%)",
    subIcons: [
      { ...R[0], emoji: "🔢", label: "Цифры", path: "/numbers", images: { ru: "/images/om_symbol.png", en: "/images/om_symbol.png", uk: "/images/om_symbol.png", sa: "/images/om_symbol.png" } },
      {
        ...R[1],
        emoji: "🔤",
        label: "Буквы",
        images: {
          ru: "/images/om_symbol.png",
          en: "/images/om_symbol.png",
          uk: "/images/om_symbol.png",
          sa: "/images/om_symbol.png",
        },
      },
      { ...R[2], emoji: "✍️", label: "Знаки", path: "/punctuation", images: { ru: "/images/om_symbol.png", en: "/images/om_symbol.png", uk: "/images/om_symbol.png", sa: "/images/om_symbol.png" } },
      { ...R[3], emoji: "🎵", label: "Ноты", path: "/notes", images: { ru: "/images/om_symbol.png", en: "/images/om_symbol.png", uk: "/images/om_symbol.png", sa: "/images/om_symbol.png" } },
      { ...R[4], emoji: "🎨", label: "Цвета", path: "/colors", images: { ru: "/images/om_symbol.png", en: "/images/om_symbol.png", uk: "/images/om_symbol.png", sa: "/images/om_symbol.png" } },
      { ...R[5], emoji: "💨", label: "Стихии", path: "/elements", images: { ru: "/images/om_symbol.png", en: "/images/om_symbol.png", uk: "/images/om_symbol.png", sa: "/images/om_symbol.png" } },
      { ...R[6], emoji: "🌍", label: "Живой мир", path: "/living-world", images: { ru: "/images/om_symbol.png", en: "/images/om_symbol.png", uk: "/images/om_symbol.png", sa: "/images/om_symbol.png" } },
    ],
  },
  {
    id: "world",
    path: "/world",
    emoji: "🌍",
    label: "Мир вокруг нас",
    text: { ru: "Пратьякша", en: "Pratyaksha", uk: "Пратьякша", sa: "प्रत्यक्ष (Pratyakṣa)" },
    image: "/images/om_symbol.png",
    gradient: "linear-gradient(140deg, #FF9F43, #E07000)",
    shadow: "rgba(200,100,0,0.40)",
    bgGradient: "linear-gradient(160deg, #FFB347 0%, #FF8C00 55%, #CC6000 100%)",
    subIcons: sub(
      ["🗺️", "🏔️", "🌊", "🏙️", "🚂", "✈️", "🧭"],
      ["Карта", "Горы", "Море", "Город", "Транспорт", "Авиация", "Компас"],
    ),
  },
  {
    id: "science",
    path: "/science",
    emoji: "⭐",
    label: "Наука",
    text: { ru: "Парокша", en: "Paroksha", uk: "Парокша", sa: "परोक्ष (Parokṣa)" },
    image: "/images/om_symbol.png",
    gradient: "linear-gradient(140deg, #FFE033, #D4B800)",
    shadow: "rgba(180,150,0,0.40)",
    bgGradient: "linear-gradient(160deg, #FFE566 0%, #FFD700 55%, #BFA000 100%)",
    subIcons: sub(
      ["🔬", "🧪", "🌡️", "💡", "🔭", "⚗️", "🧲"],
      ["Микроскоп", "Опыты", "Температура", "Открытия", "Телескоп", "Химия", "Физика"],
    ),
  },
  {
    id: "nature",
    path: "/nature",
    emoji: "🌿",
    label: "Природа",
    text: { ru: "Апарокша", en: "Aparoksha", uk: "Апарокша", sa: "अपरोक्ष (Aparokṣa)" },
    image: "/images/om_symbol.png",
    gradient: "linear-gradient(140deg, #2ECC71, #1A9950)",
    shadow: "rgba(0,150,70,0.40)",
    bgGradient: "linear-gradient(160deg, #55E07A 0%, #22C55E 55%, #15803D 100%)",
    subIcons: sub(
      ["🌸", "🐝", "🦋", "🌳", "🐸", "🌈", "🦔"],
      ["Цветы", "Пчёлы", "Бабочки", "Деревья", "Лягушки", "Радуга", "Ёжики"],
    ),
  },
  {
    id: "math",
    path: "/math",
    emoji: "🔢",
    label: "Математика",
    text: { ru: "Адхокшаджа", en: "Adhokshaja", uk: "Адхокшаджа", sa: "अधोक्षज (Adhokṣaja)" },
    image: "/images/om_symbol.png",
    gradient: "linear-gradient(140deg, #3EA6FF, #0066DD)",
    shadow: "rgba(0,80,210,0.40)",
    bgGradient: "linear-gradient(160deg, #60AFFF 0%, #2277FF 55%, #0044CC 100%)",
    subIcons: sub(
      ["➕", "➖", "✖️", "➗", "📐", "🎲", "🔣"],
      ["Сложение", "Вычитание", "Умножение", "Деление", "Геометрия", "Задачи", "Знаки"],
    ),
  },
  {
    id: "art",
    path: "/art",
    emoji: "🎨",
    label: "Творчество",
    text: { ru: "Апракрита", en: "Aprakrita", uk: "Апракрита", sa: "अप्राकृत (Aprākṛta)" },
    image: "/images/om_symbol.png",
    gradient: "linear-gradient(140deg, #6C63FF, #3A33CC)",
    shadow: "rgba(60,40,200,0.40)",
    bgGradient: "linear-gradient(160deg, #8B80FF 0%, #5B4EE0 55%, #3A30C0 100%)",
    subIcons: sub(
      ["🖌️", "🖍️", "✂️", "🪡", "🏺", "🖼️", "🎪"],
      ["Рисование", "Раскраска", "Аппликация", "Вязание", "Лепка", "Живопись", "Цирк"],
    ),
  },
  {
    id: "music",
    path: "/music",
    emoji: "🎵",
    label: "Музыка",
    text: { ru: "Веданта", en: "Vedanta", uk: "Веданта", sa: "वेदान्त (Vedānta)" },
    image: "/images/om_symbol.png",
    gradient: "linear-gradient(140deg, #C84BFF, #8000CC)",
    shadow: "rgba(130,0,200,0.40)",
    bgGradient: "linear-gradient(160deg, #D466FF 0%, #AA22FF 55%, #7700CC 100%)",
    subIcons: sub(
      ["🎸", "🥁", "🎹", "🎺", "🎻", "🎤", "🪗"],
      ["Гитара", "Барабаны", "Пианино", "Труба", "Скрипка", "Пение", "Аккордеон"],
    ),
  },
];