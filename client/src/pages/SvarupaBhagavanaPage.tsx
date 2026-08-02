import { useState } from "react";
import { useLocation } from "wouter";

// --- Яркие золотые цвета (те же, что и на главной странице) ---
const GOLD = { r: 255, g: 215, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

function mix(goldPct: number) {
  const r = Math.round(GOLD.r * goldPct + WHITE.r * (1 - goldPct));
  const g = Math.round(GOLD.g * goldPct + WHITE.g * (1 - goldPct));
  const b = Math.round(GOLD.b * goldPct + WHITE.b * (1 - goldPct));
  return `rgb(${r},${g},${b})`;
}

const COLOR_33 = mix(0.33); // самый светлый
const COLOR_67 = mix(0.67); // средний
const COLOR_100 = mix(1.0); // самый тёмный (чистое золото)

type Sector = {
  color: string;
  label: string;
};

// Порядок секторов по часовой стрелке, начиная с 12 часов (0°):
// 0–120°  — верх-право  — светлый — "Блаженство"
// 120–240° — низ         — средний — "Полное знание"
// 240–360° — верх-лево   — тёмный  — "Вечное бытие"
const SECTORS: Sector[] = [
  { color: COLOR_33, label: "Блаженство" },
  { color: COLOR_67, label: "Полное знание" },
  { color: COLOR_100, label: "Вечное бытие" },
];

const SECTOR_COUNT = SECTORS.length; // 3
const CX = 250;
const CY = 250;
const R = 250;

const toRad = (deg: number) => (deg * Math.PI) / 180;

// 1мм ≈ 3.7795 единиц viewBox (при 96px = 25.4мм и колесе 500x500px)
const MM_TO_UNITS = 96 / 25.4;
const EDGE_GAP_MM = 2;
const GAP = EDGE_GAP_MM * MM_TO_UNITS;

const HALF_ANGLE = toRad(360 / SECTOR_COUNT / 2);
const SIN_HALF = Math.sin(HALF_ANGLE);

const BADGE_R = (R * SIN_HALF - GAP * (SIN_HALF + 1)) / (1 + SIN_HALF);
const BADGE_RADIUS = R - BADGE_R - GAP;

export default function SvarupaBhagavanaPage() {
  const [, setHovered] = useState<number | null>(null);
  const [, setLocation] = useLocation();

  return (
    <div
      className="min-h-screen flex flex-col items-center bg-white gap-8 py-8"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      {/* Кнопка "Назад" */}
      <div className="w-full px-8">
        <button
          onClick={() => {
            setLocation("/");
          }}
          className="px-6 py-3 rounded-full border-2 font-bold text-lg transition bg-white"
          style={{ color: "#FFD700", borderColor: "#FFD700" }}
        >
          ← Назад
        </button>
      </div>

      {/* Колесо-сектора */}
      <div className="relative w-[500px] h-[500px] max-w-full">
        <svg viewBox="0 0 500 500" className="w-full h-full">
          {/* Сектора */}
          {SECTORS.map((sector, i) => {
            const angle = (360 / SECTOR_COUNT) * i;
            const nextAngle = (360 / SECTOR_COUNT) * (i + 1);
            const x1 = CX + R * Math.sin(toRad(angle));
            const y1 = CY - R * Math.cos(toRad(angle));
            const x2 = CX + R * Math.sin(toRad(nextAngle));
            const y2 = CY - R * Math.cos(toRad(nextAngle));
            return (
              <path
                key={i}
                d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`}
                fill={sector.color}
              />
            );
          })}

          {/* Круглые плашки с равным зазором 2мм от границ сектора */}
          {SECTORS.map((_, i) => {
            const midAngle =
              (360 / SECTOR_COUNT) * i + 360 / SECTOR_COUNT / 2;
            const bx = CX + BADGE_RADIUS * Math.sin(toRad(midAngle));
            const by = CY - BADGE_RADIUS * Math.cos(toRad(midAngle));
            return (
              <circle
                key={`badge-${i}`}
                cx={bx}
                cy={by}
                r={BADGE_R}
                fill="#FFFFFF"
                stroke="#FFD700"
                strokeWidth={3}
                onMouseEnter={() => setHovered(i)}
                onMouseLeave={() => setHovered(null)}
              />
            );
          })}

          {/* Надписи в секторах */}
          {SECTORS.map((sector, i) => {
            const midAngle =
              (360 / SECTOR_COUNT) * i + 360 / SECTOR_COUNT / 2;
            const bx = CX + BADGE_RADIUS * Math.sin(toRad(midAngle));
            const by = CY - BADGE_RADIUS * Math.cos(toRad(midAngle));
            return (
              <text
                key={`label-${i}`}
                x={bx}
                y={by}
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={13}
                fontWeight="bold"
                fontFamily="ui-sans-serif, system-ui, sans-serif"
                fill="#FFD700"
              >
                {sector.label}
              </text>
            );
          })}
        </svg>

        {/* Центральная плашка */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div
            className="px-8 py-4 rounded-full border-[3px] border-yellow-400 bg-white font-bold text-2xl text-center"
            style={{ color: "#FFD700" }}
          >
            <div>Сва-рупа</div>
            <div>Бхагавана</div>
          </div>
        </div>
      </div>
    </div>
  );
}
