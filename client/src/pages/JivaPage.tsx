import { useState } from "react";

type Category = {
  key: string;
  label: string;
};

const categories: Category[] = [
  { key: "ishvara", label: "Ишвара" },
  { key: "jiva", label: "Джива" },
  { key: "prakriti", label: "Пракрити" },
  { key: "karma", label: "Карма" },
  { key: "kala", label: "Кала" },
];

const headerNav = [
  { key: "name", label: "Имя" },
  { key: "form", label: "Форма" },
  { key: "qualities", label: "Качества" },
  { key: "plays", label: "Игры" },
];

const footerNav = [
  { key: "site-page", label: "Страница сайта" },
  { key: "all-data", label: "Доступ ко всем данным сайта" },
  { key: "languages", label: "Меню доступных языков" },
  { key: "your-page", label: "Ваша страница" },
];

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

function Wheel12({
  labels,
  centerLabel,
  onSectorClick,
}: {
  labels: string[][];
  centerLabel: string;
  onSectorClick?: (index: number) => void;
}) {
  return (
    <div className="relative w-[500px] h-[500px] max-w-full">
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
          return (
            <circle
              key={`badge-${i}`}
              cx={bx}
              cy={by}
              r={BADGE_R}
              fill="#FFFFFF"
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

          const firstDy =
            lines.length === 2 ? "-0.5em" : lines.length === 3 ? "-1.1em" : "0em";

          return (
            <text
              key={`label-${i}`}
              x={bx}
              y={by}
              textAnchor="middle"
              fontSize={LABEL_FONT_SIZE}
              fontWeight="bold"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fill="#FFD700"
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
          className="px-8 py-4 rounded-full border-[3px] border-yellow-400 bg-white font-bold text-2xl"
          style={{ color: "#FFD700" }}
        >
          {centerLabel}
        </div>
      </div>
    </div>
  );
}

export default function JivaPage() {
  const [active, setActive] = useState<Category>(categories[1]);
  const [activeNav, setActiveNav] = useState<string>(headerNav[0].key);
  const [activeFooterNav, setActiveFooterNav] = useState<string>(
    footerNav[0].key
  );

  const [view, setView] = useState<"main" | number>("main");

  const handleMainSectorClick = (index: number) => {
    setView(index);
  };

  return (
    <div
      className="min-h-screen flex flex-col bg-white"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <header className="w-full px-8 py-4 border-b border-yellow-200">
        <nav className="flex w-full gap-[0.5cm]">
          {headerNav.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className="flex-1 px-6 py-3 rounded-full border-2 font-bold text-lg transition bg-white"
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

      <main className="flex-1 flex flex-col items-center gap-8 py-8">
        <div className="relative w-full flex justify-center items-center">
          {view !== "main" && (
            <button
              onClick={() => setView("main")}
              className="absolute left-8 px-6 py-3 rounded-full border-2 font-bold text-lg transition bg-white"
              style={{ color: "#FFD700", borderColor: "#FFD700" }}
            >
              ← Назад
            </button>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            {categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setActive(cat)}
                className="px-6 py-3 rounded-full border-2 font-bold text-lg transition bg-white"
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

        {view === "main" && (
          <Wheel12
            labels={MAIN_WHEEL_LABELS}
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
      </main>

      <footer className="w-full px-8 py-4 border-t border-yellow-200">
        <nav className="flex w-full gap-[0.5cm]">
          {footerNav.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveFooterNav(item.key)}
              className="flex-1 px-6 py-3 rounded-full border-2 font-bold text-lg transition bg-white"
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