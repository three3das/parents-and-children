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
  images?: { ru: string; en: string; uk: string }; // per-language image (overrides emoji)
  path?: string; // navigation path on click
}

export interface Category {
  id: string;
  path: string;
  emoji: string;
  label: string;
  text?: { ru: string; en: string; uk: string }; // multilingual label on home button
  image?: string;     // optional image path (replaces emoji on home button)
  images?: { ru: string; en: string; uk: string }; // per-language images
  gradient: string;   // home button gradient
  shadow: string;     // home button shadow
  bgGradient: string; // category page background
  subIcons: SubIcon[];
}

// ── Shared rainbow palette for sub-icon buttons ──────────────────────────────
const R = [
  { gradient: "linear-gradient(140deg, #FF5252, #E00000)", shadow: "rgba(220,0,0,0.40)"   },
  { gradient: "linear-gradient(140deg, #FF9F43, #E07000)", shadow: "rgba(200,100,0,0.40)" },
  { gradient: "linear-gradient(140deg, #FFE033, #D4B800)", shadow: "rgba(180,150,0,0.40)" },
  { gradient: "linear-gradient(140deg, #2ECC71, #1A9950)", shadow: "rgba(0,150,70,0.40)"  },
  { gradient: "linear-gradient(140deg, #3EA6FF, #0066DD)", shadow: "rgba(0,80,210,0.40)"  },
  { gradient: "linear-gradient(140deg, #6C63FF, #3A33CC)", shadow: "rgba(60,40,200,0.40)" },
  { gradient: "linear-gradient(140deg, #C84BFF, #8000CC)", shadow: "rgba(130,0,200,0.40)" },
];

const sub = (emojis: string[], labels: string[]): SubIcon[] =>
  emojis.map((emoji, i) => ({ ...R[i], emoji, label: labels[i] }));

// ── Category definitions (order = home-page button order) ────────────────────
export const CATEGORIES: Category[] = [
  {
    id: "reading",
    path: "/reading",
    emoji: "📖",
    label: "Чтение",
    text: { ru: "Алфавит", en: "ABC book", uk: "Алфавіт" },
    image: "/images/book.png",
    gradient: "linear-gradient(140deg, #FF5252, #E00000)",
    shadow: "rgba(220,0,0,0.40)",
    bgGradient: "linear-gradient(160deg, #FF6B6B 0%, #FF2222 55%, #C00000 100%)",
    subIcons: [
      {
        ...R[0],
        emoji: "🔤",
        label: "Буквы",
        images: {
          ru: "/images/letters_russian.svg",
          en: "/images/letters_english.svg",
          uk: "/images/letters_ukrainian.svg",
        },
      },
      { ...R[1], emoji: "🔢", label: "Цифры", path: "/numbers", images: { ru: "/images/numbers.svg", en: "/images/numbers.svg", uk: "/images/numbers.svg" } },
      { ...R[2], emoji: "🎵", label: "Ноты", path: "/notes", images: { ru: "/images/notes_russian.svg", en: "/images/notes_english.svg", uk: "/images/notes_ukrainian.svg" } },
      { ...R[3], emoji: "📚", label: "Сказки", images: { ru: "/images/rainbow.svg", en: "/images/rainbow.svg", uk: "/images/rainbow.svg" } },
      ...sub(
        ["🧩", "✏️", "🎭"],
        ["Загадки", "Рисование", "Театр"],
      ).map((icon, i) => ({ ...icon, ...R[i + 4] })),
    ],
  },
  {
    id: "world",
    path: "/world",
    emoji: "🌍",
    label: "Мир вокруг нас",
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
    gradient: "linear-gradient(140deg, #C84BFF, #8000CC)",
    shadow: "rgba(130,0,200,0.40)",
    bgGradient: "linear-gradient(160deg, #D466FF 0%, #AA22FF 55%, #7700CC 100%)",
    subIcons: sub(
      ["🎸", "🥁", "🎹", "🎺", "🎻", "🎤", "🪗"],
      ["Гитара", "Барабаны", "Пианино", "Труба", "Скрипка", "Пение", "Аккордеон"],
    ),
  },
];
