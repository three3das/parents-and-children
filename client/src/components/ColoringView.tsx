import { useMemo, useState } from "react";
import { WHEEL_TEXT_COLOR } from "@/lib/colors";

// Раскраска «по областям»: картинка собрана из отдельных фигур (SVG),
// ребёнок выбирает цвет и нажимает на фигуру — она закрашивается.
// Фигуры рисуются по порядку: верхние лежат поверх нижних.
interface Region {
  id: string; // уникален в пределах одной картинки
  d: string; // контур фигуры (SVG path)
}

interface Picture {
  title: string;
  regions: Region[];
}

// ─── Помощники для рисования (холст 300 × 240) ─────────────────────────────
const r1 = (n: number) => Math.round(n * 10) / 10;

// Многоугольник по точкам: poly(x1, y1, x2, y2, ...).
const poly = (...p: number[]) => {
  let d = `M${p[0]} ${p[1]}`;
  for (let i = 2; i < p.length; i += 2) d += `L${p[i]} ${p[i + 1]}`;
  return d + "Z";
};

const rect = (x: number, y: number, w: number, h: number) =>
  poly(x, y, x + w, y, x + w, y + h, x, y + h);

const ellipse = (cx: number, cy: number, rx: number, ry: number) =>
  `M${r1(cx - rx)} ${r1(cy)}A${rx} ${ry} 0 1 1 ${r1(cx + rx)} ${r1(cy)}` +
  `A${rx} ${ry} 0 1 1 ${r1(cx - rx)} ${r1(cy)}Z`;

const circle = (cx: number, cy: number, r: number) => ellipse(cx, cy, r, r);

// Арка (окно или дверь): левый верхний угол (x, y), ширина w, высота h.
const arch = (x: number, y: number, w: number, h: number) =>
  `M${x} ${y + h}V${r1(y + w / 2)}A${w / 2} ${w / 2} 0 0 1 ${x + w} ${r1(y + w / 2)}V${y + h}Z`;

// Купол-«луковка»: центр cx, основание на высоте baseY, ширина w, высота h.
const onion = (cx: number, baseY: number, w: number, h: number) =>
  `M${r1(cx - w)} ${baseY}` +
  `C${r1(cx - w * 1.8)} ${r1(baseY - h * 0.5)} ${r1(cx - w * 0.2)} ${r1(baseY - h * 0.55)} ${cx} ${r1(baseY - h)}` +
  `C${r1(cx + w * 0.2)} ${r1(baseY - h * 0.55)} ${r1(cx + w * 1.8)} ${r1(baseY - h * 0.5)} ${r1(cx + w)} ${baseY}Z`;

// Крест: верхняя точка (cx, top), высота h, полуширина перекладины arm.
const cross = (cx: number, top: number, h = 18, arm = 7) =>
  poly(
    cx - 2, top,
    cx + 2, top,
    cx + 2, top + 5,
    cx + arm, top + 5,
    cx + arm, top + 9,
    cx + 2, top + 9,
    cx + 2, top + h,
    cx - 2, top + h,
    cx - 2, top + 9,
    cx - arm, top + 9,
    cx - arm, top + 5,
    cx - 2, top + 5
  );

// Остриё забора.
const picket = (x: number) =>
  poly(x, 190, x, 172, x + 4, 166, x + 8, 172, x + 8, 190);

// Цветок: n лепестков по кругу радиуса ring и серединка.
const flower = (
  id: string,
  cx: number,
  cy: number,
  ring: number,
  petalR: number,
  centerR: number,
  n = 6
): Region[] => {
  const petals: Region[] = Array.from({ length: n }, (_, i) => {
    const a = (Math.PI * 2 * i) / n - Math.PI / 2;
    return {
      id: `${id}-p${i}`,
      d: circle(r1(cx + ring * Math.cos(a)), r1(cy + ring * Math.sin(a)), petalR),
    };
  });
  return [...petals, { id: `${id}-c`, d: circle(cx, cy, centerR) }];
};

// Небо и земля (земля начинается с высоты groundY).
const bg = (groundY: number): Region[] => [
  { id: "sky", d: rect(0, 0, 300, 240) },
  { id: "ground", d: rect(0, groundY, 300, 240 - groundY) },
];

// ─── Картинки ──────────────────────────────────────────────────────────────
const PICTURES: Picture[] = [
  {
    title: "Храм",
    regions: [
      ...bg(185),
      { id: "sun", d: circle(40, 40, 18) },
      { id: "cloud", d: ellipse(240, 42, 30, 12) },
      { id: "trunk-l", d: rect(22, 160, 6, 26) },
      { id: "crown-l", d: ellipse(25, 145, 18, 26) },
      { id: "trunk-r", d: rect(272, 160, 6, 26) },
      { id: "crown-r", d: ellipse(275, 145, 18, 26) },
      { id: "tower-l", d: rect(60, 125, 40, 60) },
      { id: "tower-r", d: rect(200, 125, 40, 60) },
      { id: "wall", d: rect(100, 100, 100, 85) },
      { id: "drum-c", d: rect(135, 72, 30, 28) },
      { id: "drum-l", d: rect(70, 105, 20, 20) },
      { id: "drum-r", d: rect(210, 105, 20, 20) },
      { id: "dome-c", d: onion(150, 72, 22, 42) },
      { id: "dome-l", d: onion(80, 105, 13, 26) },
      { id: "dome-r", d: onion(220, 105, 13, 26) },
      { id: "cross-c", d: cross(150, 12, 18, 7) },
      { id: "cross-l", d: cross(80, 64, 15, 6) },
      { id: "cross-r", d: cross(220, 64, 15, 6) },
      { id: "door", d: arch(135, 140, 30, 45) },
      { id: "win-l1", d: arch(72, 140, 16, 24) },
      { id: "win-r1", d: arch(212, 140, 16, 24) },
      { id: "win-l2", d: arch(108, 112, 14, 22) },
      { id: "win-r2", d: arch(178, 112, 14, 22) },
      { id: "steps", d: rect(120, 185, 60, 8) },
    ],
  },
  {
    title: "Изба",
    regions: [
      ...bg(190),
      { id: "sun", d: circle(255, 40, 18) },
      { id: "cloud", d: ellipse(70, 45, 28, 11) },
      { id: "chimney", d: rect(195, 52, 14, 44) },
      ...[110, 126, 142, 158, 174].map((y, i) => ({
        id: `log${i}`,
        d: rect(75, y, 150, 16),
      })),
      { id: "roof", d: poly(58, 114, 150, 48, 242, 114) },
      { id: "gable-o", d: circle(150, 92, 15) },
      { id: "gable-i", d: circle(150, 92, 9) },
      { id: "frame-l", d: rect(86, 126, 40, 42) },
      { id: "pane-l1", d: rect(90, 130, 15, 16) },
      { id: "pane-l2", d: rect(107, 130, 15, 16) },
      { id: "pane-l3", d: rect(90, 148, 15, 16) },
      { id: "pane-l4", d: rect(107, 148, 15, 16) },
      { id: "frame-r", d: rect(174, 126, 40, 42) },
      { id: "pane-r1", d: rect(178, 130, 15, 16) },
      { id: "pane-r2", d: rect(195, 130, 15, 16) },
      { id: "pane-r3", d: rect(178, 148, 15, 16) },
      { id: "pane-r4", d: rect(195, 148, 15, 16) },
      { id: "door", d: arch(138, 142, 24, 48) },
      { id: "step", d: rect(132, 190, 36, 7) },
      { id: "picket-l1", d: picket(14) },
      { id: "picket-l2", d: picket(28) },
      { id: "picket-l3", d: picket(42) },
      { id: "rail-l", d: rect(12, 178, 40, 5) },
      { id: "picket-r1", d: picket(250) },
      { id: "picket-r2", d: picket(264) },
      { id: "picket-r3", d: picket(278) },
      { id: "rail-r", d: rect(248, 178, 40, 5) },
      ...flower("fl1", 95, 215, 8, 6, 5, 5),
      ...flower("fl2", 205, 215, 8, 6, 5, 5),
    ],
  },
  {
    title: "Матрёшка",
    regions: [
      { id: "wall", d: rect(0, 0, 300, 240) },
      { id: "table", d: rect(0, 205, 300, 35) },
      { id: "sun", d: circle(45, 45, 18) },
      { id: "body", d: ellipse(150, 138, 60, 68) },
      { id: "apron", d: ellipse(150, 152, 38, 46) },
      ...flower("fl", 150, 152, 14, 7.5, 6, 5),
      { id: "fl-l", d: circle(109, 176, 8) },
      { id: "fl-r", d: circle(191, 176, 8) },
      { id: "head", d: circle(150, 80, 34) },
      { id: "face", d: ellipse(150, 90, 23, 22) },
      { id: "scarf", d: "M116 80A34 34 0 0 1 184 80Q150 58 116 80Z" },
      { id: "eye-l", d: circle(141, 90, 2.5) },
      { id: "eye-r", d: circle(159, 90, 2.5) },
      { id: "cheek-l", d: circle(134, 98, 4.5) },
      { id: "cheek-r", d: circle(166, 98, 4.5) },
      { id: "mouth", d: ellipse(150, 103, 5, 2.5) },
    ],
  },
  {
    title: "Самовар",
    regions: [
      { id: "wall", d: rect(0, 0, 300, 240) },
      { id: "table", d: rect(0, 200, 300, 40) },
      { id: "steam-1", d: ellipse(150, 72, 10, 6) },
      { id: "steam-2", d: ellipse(158, 60, 8, 5) },
      { id: "steam-3", d: ellipse(146, 50, 7, 4) },
      { id: "handle-l", d: ellipse(88, 140, 10, 14) },
      { id: "handle-r", d: ellipse(212, 140, 10, 14) },
      { id: "foot", d: rect(108, 190, 84, 10) },
      {
        id: "body",
        d: "M100 120C80 140 80 180 105 190H195C220 180 220 140 200 120Z",
      },
      { id: "band", d: rect(92, 148, 116, 10) },
      { id: "medal", d: circle(150, 153, 12) },
      { id: "lid", d: "M110 121Q150 88 190 121Z" },
      { id: "pipe", d: rect(142, 94, 16, 12) },
      { id: "cap", d: rect(136, 86, 28, 8) },
      { id: "tap", d: rect(78, 166, 24, 8) },
      { id: "tap-knob", d: circle(76, 170, 6) },
      { id: "saucer-l", d: ellipse(50, 205, 26, 5) },
      { id: "cup-handle-l", d: ellipse(28, 188, 6, 7) },
      { id: "cup-l", d: "M32 180H68V194Q68 204 50 204Q32 204 32 194Z" },
      { id: "saucer-r", d: ellipse(250, 205, 26, 5) },
      { id: "cup-handle-r", d: ellipse(272, 188, 6, 7) },
      { id: "cup-r", d: "M232 180H268V194Q268 204 250 204Q232 204 232 194Z" },
    ],
  },
  {
    title: "Колокольня",
    regions: [
      ...bg(200),
      { id: "cloud-l", d: ellipse(70, 50, 28, 11) },
      { id: "cloud-r", d: ellipse(240, 38, 25, 10) },
      { id: "trunk-l", d: rect(36, 172, 8, 28) },
      { id: "crown-l", d: ellipse(40, 150, 22, 30) },
      { id: "trunk-r", d: rect(256, 172, 8, 28) },
      { id: "crown-r", d: ellipse(260, 150, 22, 30) },
      { id: "tier-1", d: rect(105, 140, 90, 60) },
      { id: "tier-2", d: rect(115, 100, 70, 40) },
      { id: "tier-3", d: rect(125, 72, 50, 28) },
      { id: "ledge-1", d: rect(100, 136, 100, 6) },
      { id: "ledge-2", d: rect(110, 96, 80, 6) },
      { id: "ledge-3", d: rect(120, 68, 60, 6) },
      { id: "roof", d: poly(122, 70, 150, 22, 178, 70) },
      { id: "cross", d: cross(150, 4, 18, 7) },
      { id: "arch-top", d: arch(138, 78, 24, 22) },
      { id: "bell-top", d: "M145 100V92Q145 86 150 86Q155 86 155 92V100Z" },
      { id: "arch-m1", d: arch(124, 106, 20, 34) },
      { id: "arch-m2", d: arch(156, 106, 20, 34) },
      { id: "gate", d: arch(135, 152, 30, 48) },
      { id: "win-l", d: arch(113, 156, 16, 26) },
      { id: "win-r", d: arch(171, 156, 16, 26) },
      { id: "steps", d: rect(125, 200, 50, 7) },
    ],
  },
  {
    title: "Цветы в вазе",
    regions: [
      { id: "wall", d: rect(0, 0, 300, 240) },
      { id: "table", d: rect(0, 190, 300, 50) },
      { id: "stem-c", d: poly(148, 112, 152, 112, 152, 58, 148, 58) },
      { id: "stem-l", d: poly(138, 112, 143, 112, 108, 82, 103, 82) },
      { id: "stem-r", d: poly(157, 112, 162, 112, 197, 82, 192, 82) },
      { id: "leaf-l", d: ellipse(128, 100, 13, 6) },
      { id: "leaf-r", d: ellipse(172, 100, 13, 6) },
      ...flower("fc", 150, 45, 15, 11, 8, 6),
      ...flower("fl", 105, 72, 12, 9, 6, 6),
      ...flower("fr", 195, 72, 12, 9, 6, 6),
      { id: "neck", d: rect(135, 112, 30, 20) },
      { id: "rim", d: rect(130, 106, 40, 8) },
      {
        id: "vase",
        d: "M135 130C95 150 100 185 125 190H175C200 185 205 150 165 130Z",
      },
      { id: "band", d: rect(110, 152, 80, 10) },
      { id: "medal", d: circle(150, 157, 11) },
      ...flower("ft1", 55, 215, 6, 5, 4, 5),
      ...flower("ft2", 245, 215, 6, 5, 4, 5),
    ],
  },
];

const PALETTE = [
  "#FF4D4D", "#FF9F1C", "#FFD700", "#4CAF50",
  "#2EC4B6", "#2563EB", "#9B5DE5", "#F78FB3",
  "#8B5A2B", "#9CA3AF", "#111827", "#FFFFFF",
];

const BUTTON_CLASS =
  "flex-1 h-12 px-2 rounded-full border-2 font-bold text-sm sm:text-base transition bg-white whitespace-nowrap";

export default function ColoringView() {
  const [pictureIndex, setPictureIndex] = useState(0);
  const [color, setColor] = useState(PALETTE[0]);
  const [fills, setFills] = useState<Record<string, string>>({});

  const picture = PICTURES[pictureIndex];
  const style = useMemo(
    () => ({ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }),
    []
  );

  const paint = (id: string) => setFills((prev) => ({ ...prev, [id]: color }));
  const clear = () => setFills({});
  const openPicture = (index: number) => {
    setFills({});
    setPictureIndex(index);
  };
  const next = () => openPicture((pictureIndex + 1) % PICTURES.length);

  return (
    <div className="w-full h-full flex items-start justify-center px-4 pt-4 bg-white overflow-y-auto">
      <div className="flex flex-col items-center gap-4 w-full max-w-md text-center">
        <p className="text-xl font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
          Раскраска: {picture.title}
        </p>

        <svg
          viewBox="0 0 300 240"
          className="w-full rounded-2xl border-2"
          style={{ borderColor: "#FFD700" }}
          role="img"
          aria-label={picture.title}
        >
          {picture.regions.map((r) => (
            <path
              key={`${pictureIndex}-${r.id}`}
              d={r.d}
              fill={fills[r.id] ?? "#FFFFFF"}
              stroke="#111827"
              strokeWidth={2}
              strokeLinejoin="round"
              className="cursor-pointer"
              onClick={() => paint(r.id)}
            />
          ))}
        </svg>

        <div className="flex flex-wrap justify-center gap-2 w-full">
          {PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              aria-label={`Цвет ${c}`}
              onClick={() => setColor(c)}
              className="w-10 h-10 rounded-full border-2 transition"
              style={{
                backgroundColor: c,
                borderColor: color === c ? WHEEL_TEXT_COLOR : "#D1D5DB",
                boxShadow: color === c ? "0 0 0 3px #FFD700" : "none",
              }}
            />
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 w-full">
          {PICTURES.map((p, i) => (
            <button
              key={p.title}
              type="button"
              onClick={() => openPicture(i)}
              className="px-3 py-1 rounded-full border-2 font-bold text-sm transition"
              style={{
                ...style,
                backgroundColor: i === pictureIndex ? "#FFF6C2" : "#FFFFFF",
              }}
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full pb-4">
          <button type="button" onClick={clear} className={BUTTON_CLASS} style={style}>
            Очистить
          </button>
          <button type="button" onClick={next} className={BUTTON_CLASS} style={style}>
            Следующая картинка
          </button>
        </div>
      </div>
    </div>
  );
}