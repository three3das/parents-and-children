import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeaderFooter";

// ── Color data ────────────────────────────────────────────────────────────────

const COLORS: { hex: string; ru: string; uk: string; en: string }[] = [
  { hex: "#FFFFFF", ru: "Белый",       uk: "Білий",        en: "White"      },
  { hex: "#FF2020", ru: "Красный",     uk: "Червоний",     en: "Red"        },
  { hex: "#FF8C00", ru: "Оранжевый",   uk: "Помаранчевий", en: "Orange"     },
  { hex: "#FFE600", ru: "Жёлтый",      uk: "Жовтий",       en: "Yellow"     },
  { hex: "#00CC44", ru: "Зелёный",     uk: "Зелений",      en: "Green"      },
  { hex: "#1E90FF", ru: "Синий",       uk: "Синій",        en: "Blue"       },
  { hex: "#9932CC", ru: "Фиолетовый",  uk: "Фіолетовий",   en: "Purple"     },
  { hex: "#FF69B4", ru: "Розовый",     uk: "Рожевий",      en: "Pink"       },
  { hex: "#8B4513", ru: "Коричневый",  uk: "Коричневий",   en: "Brown"      },
  { hex: "#808080", ru: "Серый",       uk: "Сірий",        en: "Gray"       },
  { hex: "#87CEEB", ru: "Голубой",     uk: "Блакитний",    en: "Light blue" },
  { hex: "#111111", ru: "Чёрный",      uk: "Чорний",       en: "Black"      },
];

const SPEECH_LANG: Record<string, string> = {
  ru: "ru-RU",
  uk: "uk-UA",
  en: "en-US",
};

// ── Audio playback ────────────────────────────────────────────────────────────

function playColor(name: string, lang: string) {
  const path = `/audio/colors/${lang}/${encodeURIComponent(name)}.mp3`;
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

export default function ColorsPage() {
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
        {/* Colors grid — 4 cols × 3 rows */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(3, 1fr)",
            gap: "clamp(4px, 0.8vw, 10px)",
          }}
        >
          {COLORS.map((c, i) => {
            const name = (c as Record<string, string>)[language] ?? c.ru;
            return (
              <button
                key={i}
                onClick={() => playColor(name, language)}
                style={{
                  background: "rgba(255,255,255,0.15)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  borderRadius: "clamp(8px, 1.5vw, 16px)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "clamp(4px, 0.8vw, 10px)",
                  padding: "clamp(6px, 1vw, 14px)",
                  transition: "background 0.15s, transform 0.1s",
                  userSelect: "none",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.30)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
                }}
              >
                {/* Color swatch */}
                <div
                  style={{
                    width: "clamp(28px, 4.5vw, 58px)",
                    height: "clamp(28px, 4.5vw, 58px)",
                    borderRadius: "50%",
                    background: c.hex,
                    border: "3px solid rgba(255,255,255,0.85)",
                    flexShrink: 0,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
                  }}
                />
                {/* Color name */}
                <span
                  style={{
                    color: "white",
                    fontWeight: 800,
                    fontSize: "clamp(0.8rem, 2vw, 1.9rem)",
                    textShadow: "0 2px 4px rgba(0,0,0,0.4)",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    lineHeight: 1.1,
                    textAlign: "center",
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
