import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage, LANGUAGE_FLAGS } from "@/lib/i18n";

type Category = {
  key: string;
  label: string;
};

const categories: Category[] = [
  { key: "ishvara", label: "Астрология" },
  { key: "jiva", label: "Здоровье" },
  { key: "prakriti", label: "Игры" },
  { key: "karma", label: "Природа Материального мира" },
  { key: "kala", label: "Творчество" },
];

const headerNav = [
  { key: "name", label: "Первое имя участника" },
  { key: "form", label: "Второе имя участника" },
  { key: "qualities", label: "Третье имя участника" },
  { key: "plays", label: "Четвертое имя участника" },
];

const footerNav = [
  { key: "site-page", label: "Страница сайта" },
  { key: "all-data", label: "Доступ ко всем данным сайта" },
  { key: "languages", label: "Меню доступных языков" },
  { key: "your-page", label: "Ваша страница" },
];

// Список языков для колеса языкового меню — 12 секторов, по часовой
// стрелке, начиная с 12 часов, в заданном порядке.
// Санскрит стоит первым и является языком по умолчанию (см. DEFAULT_LANGUAGE ниже).
const languageOptions = [
  { code: "sa", label: "Санскрит" },
  { code: "hi", label: "Хинди" },
  { code: "bn", label: "Бенгальский" },
  { code: "en", label: "Английский" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Украинский" },
  { code: "de", label: "Немецкий" },
  { code: "fr", label: "Французский" },
  { code: "es", label: "Испанский" },
  { code: "zh", label: "Китайский" },
  { code: "ar", label: "Арабский" },
  { code: "ur", label: "Урду" },
];

// Язык по умолчанию — Санскрит. Именно он должен быть активен изначально,
// пока пользователь не выберет другой язык в колесе.
const DEFAULT_LANGUAGE = "sa";

// --- Яркие золотые цвета ---
const GOLD = { r: 255, g: 215, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

function mix(goldPct: number) {
  const r = Math.round(GOLD.r * goldPct + WHITE.r * (1 - goldPct));
  const g = Math.round(GOLD.g * goldPct + WHITE.g * (1 - goldPct));
  const b = Math.round(GOLD.b * goldPct + WHITE.b * (1 - goldPct));
  return `rgb(${r},${g},${b})`;
}

const COLOR_33 = mix(0.33);
const COLOR_67 = mix(0.67);
const COLOR_100 = mix(1.0);

function sectorColor(i: number) {
  const m = i % 3;
  if (m === 0) return COLOR_33;
  if (m === 1) return COLOR_67;
  return COLOR_100;
}

const SECTOR_COUNT = 12;
const CX = 250;
const CY = 250;
const R = 250;

const toRad = (deg: number) => (deg * Math.PI) / 180;

const MM_TO_UNITS = 96 / 25.4;
const EDGE_GAP_MM = 2;
const GAP = EDGE_GAP_MM * MM_TO_UNITS;

const HALF_ANGLE = toRad(360 / SECTOR_COUNT / 2);
const SIN_HALF = Math.sin(HALF_ANGLE);

const BADGE_R =
  (R * SIN_HALF - GAP * (SIN_HALF + 1)) / (1 + SIN_HALF);
const BADGE_RADIUS = R - BADGE_R - GAP;

const LABEL_FONT_SIZE = 8.4;

const MAIN_WHEEL_LABELS: string[][] = [
  ["Сва-рупа", "Бхагавана"],
  ["Сва-рупа", "Параматмы"],
  ["Сва-рупа", "Брахмана"],
  ["Вечное бытие", "Сва-рупы", "Бхагавана"],
  ["Вечное бытие", "Сва-рупы", "Параматмы"],
  ["Вечное бытие", "Сва-рупы", "Брахмана"],
  ["Полное знание", "Сва-рупы", "Бхагавана"],
  ["Полное знание", "Сва-рупы", "Параматмы"],
  ["Полное знание", "Сва-рупы", "Брахмана"],
  ["Блаженство", "Сва-рупы", "Бхагавана"],
  ["Блаженство", "Сва-рупы", "Параматмы"],
  ["Блаженство", "Сва-рупы", "Брахмана"],
];

const SUB_WHEEL_CENTER_LABELS: string[] = MAIN_WHEEL_LABELS.map((lines) =>
  lines.join(" ")
);

const SUB_WHEEL_LABELS: string[][][] = Array.from(
  { length: SECTOR_COUNT },
  () => MAIN_WHEEL_LABELS
);

// Страница "Словарь используемых на сайте слов" (открывается по кнопке
// "Страница сайта" в футере). Заполнен только первый кружок — остальные
// 11 оставлены пустыми.
const DICTIONARY_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) =>
    i === 0
      ? ["Словарь", "используемых", "на сайте", "слов"]
      : []
);

// --- Колесо категории "Игры" ---
//
// Все 7 игр, найденные в GameMenu.tsx (тип GameType из "@shared/schema"),
// в том же порядке, что и в массиве gameTypes. Заполнены только первые
// 7 секторов (по часовой стрелке от 12 часов) — оставшиеся 5 пустые.
type GameType =
  | "alphabet-placeholder"
  | "picture-match"
  | "spell-word"
  | "syllables"
  | "sentence-game"
  | "audio-picture"
  | "audio-sentence";

const GAMES: { type: GameType; icon: string; label: string }[] = [
  { type: "alphabet-placeholder", icon: "🔤", label: "Алфавит" },
  { type: "picture-match", icon: "🖼️", label: "Картинки" },
  { type: "spell-word", icon: "✏️", label: "Слово" },
  { type: "syllables", icon: "🧱", label: "Слоги" },
  { type: "sentence-game", icon: "📝", label: "Предложение" },
  { type: "audio-picture", icon: "🔊", label: "Аудио-картинка" },
  { type: "audio-sentence", icon: "🎧", label: "Аудио-фраза" },
];

const GAME_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < GAMES.length ? [GAMES[i].icon, GAMES[i].label] : [])
);

function Wheel12({
  labels,
  centerLabel,
  onSectorClick,
  activeIndex,
}: {
  labels: string[][];
  centerLabel: string;
  onSectorClick?: (index: number) => void;
  activeIndex?: number;
}) {
  return (
    <div className="relative aspect-square h-full max-h-full max-w-full">
      <svg viewBox="0 0 500 500" className="w-full h-full">
        {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
          const angle = (360 / SECTOR_COUNT) * i;
          const nextAngle = (360 / SECTOR_COUNT) * (i + 1);
          const x1 = CX + R * Math.sin(toRad(angle));
          const y1 = CY - R * Math.cos(toRad(angle));
          const x2 = CX + R * Math.sin(toRad(nextAngle));
          const y2 = CY - R * Math.cos(toRad(nextAngle));
          const fill = sectorColor(i);
          return (
            <path
              key={i}
              d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`}
              fill={fill}
            />
          );
        })}

        {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
          const midAngle =
            (360 / SECTOR_COUNT) * i + 360 / SECTOR_COUNT / 2;
          const bx = CX + BADGE_RADIUS * Math.sin(toRad(midAngle));
          const by = CY - BADGE_RADIUS * Math.cos(toRad(midAngle));
          const clickable = Boolean(onSectorClick);
          const isActive = i === activeIndex;
          return (
            <circle
              key={`badge-${i}`}
              cx={bx}
              cy={by}
              r={BADGE_R}
              fill={isActive ? "#FFD700" : "#FFFFFF"}
              stroke="#FFD700"
              strokeWidth={3}
              style={clickable ? { cursor: "pointer" } : undefined}
              onClick={clickable ? () => onSectorClick!(i) : undefined}
            />
          );
        })}

        {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
          const midAngle =
            (360 / SECTOR_COUNT) * i + 360 / SECTOR_COUNT / 2;
          const bx = CX + BADGE_RADIUS * Math.sin(toRad(midAngle));
          const by = CY - BADGE_RADIUS * Math.cos(toRad(midAngle));
          const lines = labels[i] || [];
          const clickable = Boolean(onSectorClick);
          const isActive = i === activeIndex;

          const firstDy =
            lines.length === 1
              ? "0.32em"
              : lines.length === 2
              ? "-0.5em"
              : lines.length === 3
              ? "-1.1em"
              : lines.length === 4
              ? "-1.7em"
              : "0em";

          return (
            <text
              key={`label-${i}`}
              x={bx}
              y={by}
              textAnchor="middle"
              fontSize={LABEL_FONT_SIZE}
              fontWeight="bold"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fill={isActive ? "#FFFFFF" : "#FFD700"}
              style={clickable ? { cursor: "pointer" } : undefined}
              onClick={clickable ? () => onSectorClick!(i) : undefined}
            >
              {lines.map((line, li) => (
                <tspan key={li} x={bx} dy={li === 0 ? firstDy : "1.2em"}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="px-6 py-3 rounded-full border-[3px] border-yellow-400 bg-white font-bold text-xl"
          style={{ color: "#FFD700" }}
        >
          {centerLabel}
        </div>
      </div>
    </div>
  );
}

// Колесо выбора языка: 12 секторов (те же цвета/позиции, что и у
// основного колеса), в каждом секторе — название одного языка.
// Активный (выбранный) язык подсвечивается золотой заливкой кружка.
// Изначально (до выбора пользователем) активным считается Санскрит —
// см. DEFAULT_LANGUAGE и эффект инициализации в IshvaraPage.
function LanguagesWheelView({
  activeLanguage,
  onSelectLanguage,
}: {
  activeLanguage: string;
  onSelectLanguage: (code: string) => void;
}) {
  const labels = languageOptions.map((lang) => [lang.label]);
  const activeIndex = languageOptions.findIndex(
    (lang) => lang.code === activeLanguage
  );
  const activeLabel =
    activeIndex >= 0 ? languageOptions[activeIndex].label : "Язык";

  return (
    <Wheel12
      labels={labels}
      centerLabel={activeLabel}
      activeIndex={activeIndex >= 0 ? activeIndex : undefined}
      onSectorClick={(index) => onSelectLanguage(languageOptions[index].code)}
    />
  );
}

export default function IshvaraPage() {
  const [active, setActive] = useState<Category>(categories[0]);
  const [activeNav, setActiveNav] = useState<string>(headerNav[0].key);
  const [activeFooterNav, setActiveFooterNav] = useState<string>(
    footerNav[0].key
  );

  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();

  // Санскрит — язык по умолчанию. Если хук useLanguage() ещё не
  // выставил ни один из известных 12 языков (например, при самом
  // первом заходе на сайт, когда в хранилище ничего не сохранено),
  // принудительно устанавливаем Санскрит один раз при монтировании.
  useEffect(() => {
    const knownCodes = languageOptions.map((l) => l.code);
    if (!language || !knownCodes.includes(language)) {
      setLanguage(DEFAULT_LANGUAGE as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // "main" — исходное колесо, число (0–11) — вложенное колесо сектора,
  // "languages" — страница выбора языка,
  // "dictionary" — страница "Словарь используемых на сайте слов".
  const [view, setView] = useState<
    "main" | number | "languages" | "dictionary"
  >("main");

  const isGamesCategory = active.key === "prakriti";

  const handleMainSectorClick = (index: number) => {
    if (isGamesCategory) {
      const game = GAMES[index];
      if (game) {
        setLocation(`/game?type=${game.type}`);
      }
      return;
    }
    setView(index);
  };

  const handleFooterClick = (key: string) => {
    setActiveFooterNav(key);
    if (key === "languages") {
      setView("languages");
    } else if (key === "site-page") {
      setView("dictionary");
    }
  };

  const handleSelectLanguage = (code: string) => {
    setLanguage(code as any);
    setView("main");
  };

  return (
    <div
      className="h-screen w-screen flex flex-col bg-white overflow-hidden"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <header className="flex-shrink-0 w-full px-6 py-2 border-b border-yellow-200">
        <nav className="flex w-full gap-[0.5cm]">
          {headerNav.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className="flex-1 px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
              style={{
                color: "#FFD700",
                borderColor: activeNav === item.key ? "#FFD700" : "#FFE066",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 min-h-0 flex flex-col items-center gap-2 py-2 overflow-hidden">
        <div className="flex-shrink-0 relative w-full flex justify-center items-center">
          {view !== "main" && (
            <button
              onClick={() => setView("main")}
              className="absolute left-6 px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
              style={{ color: "#FFD700", borderColor: "#FFD700" }}
            >
              ← Назад
            </button>
          )}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => {
                  setActive(cat);
                  setView("main");
                }}
                className="px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
                style={{
                  color: "#FFD700",
                  borderColor: active.key === cat.key ? "#FFD700" : "#FFE066",
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
          {view === "main" && (
            <Wheel12
              labels={isGamesCategory ? GAME_WHEEL_LABELS : MAIN_WHEEL_LABELS}
              centerLabel={active.label}
              onSectorClick={handleMainSectorClick}
            />
          )}

          {typeof view === "number" && (
            <Wheel12
              labels={SUB_WHEEL_LABELS[view]}
              centerLabel={SUB_WHEEL_CENTER_LABELS[view]}
            />
          )}

          {view === "languages" && (
            <LanguagesWheelView
              activeLanguage={language}
              onSelectLanguage={handleSelectLanguage}
            />
          )}

          {view === "dictionary" && (
            <Wheel12 labels={DICTIONARY_LABELS} centerLabel={active.label} />
          )}
        </div>
      </main>

      <footer className="flex-shrink-0 w-full px-6 py-2 border-t border-yellow-200">
        <nav className="flex w-full gap-[0.5cm]">
          {footerNav.map((item) => (
            <button
              key={item.key}
              onClick={() => handleFooterClick(item.key)}
              className="flex-1 px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
              style={{
                color: "#FFD700",
                borderColor:
                  activeFooterNav === item.key ? "#FFD700" : "#FFE066",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </footer>
    </div>
  );
}
