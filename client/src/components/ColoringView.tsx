import { useMemo, useState } from "react";
import { WHEEL_TEXT_COLOR } from "@/lib/colors";

interface Region {
  id: string;
  d: string;
}

interface Picture {
  title: string;
  regions: Region[];
}

// Каждая область — отдельная фигура. Рисуются по порядку: верхние поверх нижних.
const PICTURES: Picture[] = [
  {
    title: "Храм",
    regions: [
      { id: "sky", d: "M0 0H300V170H0Z" },
      { id: "ground", d: "M0 170H300V240H0Z" },
      { id: "sun", d: "M20 40A20 20 0 1 1 60 40A20 20 0 1 1 20 40Z" },
      { id: "wall", d: "M90 90H210V170H90Z" },
      { id: "tower-l", d: "M60 110H90V170H60Z" },
      { id: "tower-r", d: "M210 110H240V170H210Z" },
      { id: "dome-l", d: "M60 110A15 15 0 0 1 90 110Z" },
      { id: "dome-r", d: "M210 110A15 15 0 0 1 240 110Z" },
      { id: "dome", d: "M105 90A45 45 0 0 1 195 90Z" },
      { id: "door", d: "M135 170V135A15 15 0 0 1 165 135V170Z" },
    ],
  },
  {
    title: "Домик",
    regions: [
      { id: "sky", d: "M0 0H300V190H0Z" },
      { id: "ground", d: "M0 190H300V240H0Z" },
      { id: "sun", d: "M20 40A20 20 0 1 1 60 40A20 20 0 1 1 20 40Z" },
      { id: "chimney", d: "M180 85V50H195V95Z" },
      { id: "wall", d: "M90 110H210V190H90Z" },
      { id: "roof", d: "M75 110L150 50L225 110Z" },
      { id: "window-l", d: "M100 125H125V150H100Z" },
      { id: "window-r", d: "M175 125H200V150H175Z" },
      { id: "door", d: "M135 190V145H165V190Z" },
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
  const next = () => {
    setFills({});
    setPictureIndex((pictureIndex + 1) % PICTURES.length);
  };

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
                boxShadow: color === c ? `0 0 0 3px #FFD700` : "none",
              }}
            />
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