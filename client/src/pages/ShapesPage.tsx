import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeaderFooter";

// ── Shape names per language ──────────────────────────────────────────────────

const SHAPES: { ru: string; uk: string; en: string; is3d: boolean }[] = [
  { ru: "Круг",        uk: "Коло",         en: "Circle",    is3d: false },
  { ru: "Квадрат",     uk: "Квадрат",      en: "Square",    is3d: false },
  { ru: "Прямоуголь.", uk: "Прямокутник",  en: "Rectangle", is3d: false },
  { ru: "Треугольник", uk: "Трикутник",    en: "Triangle",  is3d: false },
  { ru: "Овал",        uk: "Овал",         en: "Oval",      is3d: false },
  { ru: "Шар",         uk: "Куля",         en: "Sphere",    is3d: true  },
  { ru: "Куб",         uk: "Куб",          en: "Cube",      is3d: true  },
  { ru: "Параллелеп.", uk: "Паралелелепід",en: "Cuboid",    is3d: true  },
  { ru: "Пирамида",    uk: "Піраміда",     en: "Pyramid",   is3d: true  },
  { ru: "Цилиндр",     uk: "Циліндр",      en: "Cylinder",  is3d: true  },
];

const SPEECH_LANG: Record<string, string> = {
  ru: "ru-RU",
  uk: "uk-UA",
  en: "en-US",
};

// ── Audio playback ────────────────────────────────────────────────────────────

function playShape(name: string, lang: string) {
  const path = `/audio/shapes/${lang}/${encodeURIComponent(name)}.mp3`;
  const audio = new Audio(path);
  audio.play().catch(() => {
    try {
      const u = new SpeechSynthesisUtterance(name);
      u.lang = SPEECH_LANG[lang] ?? "ru-RU";
      u.rate = 0.7;
      speechSynthesis.speak(u);
    } catch {}
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function ShapesPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <SiteHeader onBack={() => navigate("/reading")} />

      <div
        style={{
          flex: 1,
          background: "linear-gradient(135deg, #FF5252 0%, #E00000 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          padding: "clamp(10px, 2vw, 20px)",
        }}
      >
        {/* Shapes grid — 5 cols × 2 rows (row 1: 2D, row 2: 3D) */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "clamp(4px, 0.8vw, 10px)",
          }}
        >
          {SHAPES.map((shape, i) => {
            const name = (shape as Record<string, string>)[language] ?? shape.ru;
            return (
              <button
                key={i}
                onClick={() => playShape(name, language)}
                style={{
                  background: shape.is3d
                    ? "rgba(255,255,255,0.22)"
                    : "rgba(255,255,255,0.12)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  borderRadius: "clamp(8px, 1.5vw, 16px)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  padding: 0,
                  transition: "background 0.15s, transform 0.1s",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.35)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = shape.is3d
                    ? "rgba(255,255,255,0.22)"
                    : "rgba(255,255,255,0.12)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
                }}
              >
                <span
                  style={{
                    color: "white",
                    fontWeight: 900,
                    fontSize: "clamp(1rem, 2.5vw, 2.8rem)",
                    textShadow: "0 2px 6px rgba(0,0,0,0.35)",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    lineHeight: 1.1,
                    textAlign: "center",
                    padding: "0 4px",
                  }}
                >
                  {name}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
