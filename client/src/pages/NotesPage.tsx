import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";

// ── Note names per language ───────────────────────────────────────────────────

const NOTE_NAMES: Record<string, string[]> = {
  ru: ["до", "ре", "ми", "фа", "соль", "ля", "си"],
  uk: ["до", "ре", "мі", "фа", "соль", "ля", "сі"],
  en: ["do", "re", "mi", "fa", "sol", "la", "ti"],
};

const SPEECH_LANG: Record<string, string> = {
  ru: "ru-RU",
  uk: "uk-UA",
  en: "en-US",
};

// ── Audio playback ────────────────────────────────────────────────────────────

function playNote(index: number, lang: string) {
  const name = NOTE_NAMES[lang]?.[index];
  if (!name) return;
  const path = `/audio/notes/${lang}/${index}.mp3`;
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

export default function NotesPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();
  const notes = NOTE_NAMES[language] ?? NOTE_NAMES.ru;

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
        {/* Notes grid — 4 cols × 2 rows (7 of 8 slots filled) */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "clamp(4px, 0.8vw, 10px)",
          }}
        >
          {notes.map((name, i) => (
            <button
              key={i}
              onClick={() => playNote(i, language)}
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
                  fontSize: "clamp(2rem, 6vw, 5.5rem)",
                  textShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  lineHeight: 1,
                }}
              >
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
