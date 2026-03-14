import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";

// ── Number names per language (for speech synthesis fallback) ─────────────────

const NUMBER_NAMES: Record<string, string[]> = {
  ru: ["ноль", "один", "два", "три", "четыре", "пять", "шесть", "семь", "восемь", "девять"],
  uk: ["нуль", "один", "два", "три", "чотири", "п'ять", "шість", "сім", "вісім", "дев'ять"],
  en: ["zero", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine"],
};

const SPEECH_LANG: Record<string, string> = {
  ru: "ru-RU",
  uk: "uk-UA",
  en: "en-US",
};

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

// ── Audio playback ────────────────────────────────────────────────────────────

function playNumber(digit: number, lang: string) {
  const path = `/audio/numbers/${lang}/${digit}.mp3`;
  const audio = new Audio(path);
  audio.play().catch(() => {
    try {
      const name = NUMBER_NAMES[lang]?.[digit] ?? String(digit);
      const u = new SpeechSynthesisUtterance(name);
      u.lang = SPEECH_LANG[lang] ?? "ru-RU";
      u.rate = 0.7;
      speechSynthesis.speak(u);
    } catch {}
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function NumbersPage() {
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
        {/* Number grid — 5 cols × 2 rows */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "clamp(4px, 0.8vw, 10px)",
          }}
        >
          {DIGITS.map((digit) => (
            <button
              key={digit}
              onClick={() => playNumber(digit, language)}
              style={{
                background: "rgba(255,255,255,0.15)",
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
              <span
                style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: "clamp(2.5rem, 8vw, 7rem)",
                  textShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  lineHeight: 1,
                }}
              >
                {digit}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
