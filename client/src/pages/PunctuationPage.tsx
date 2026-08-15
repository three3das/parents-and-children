import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeaderFooter";

const MARKS: {
  symbol: string;
  ru: string; uk: string; en: string;
}[] = [
  { symbol: "()", ru: "Скобки",       uk: "Дужки",           en: "Brackets"    },
  { symbol: "«»", ru: "Кавычки",      uk: "Лапки",           en: "Quotes"      },
  { symbol: "-",  ru: "Дефис",        uk: "Дефіс",           en: "Hyphen"      },
  { symbol: "—",  ru: "Тире",         uk: "Тире",            en: "Dash"        },
  { symbol: ".",  ru: "Точка",        uk: "Крапка",          en: "Period"      },
  { symbol: ",",  ru: "Запятая",      uk: "Кома",            en: "Comma"       },
  { symbol: ":",  ru: "Двоеточие",    uk: "Двокрапка",       en: "Colon"       },
  { symbol: ";",  ru: "Точка с зап.", uk: "Крапка з комою",  en: "Semicolon"   },
  { symbol: "!",  ru: "Восклиц.!",    uk: "Оклик",           en: "Exclamation" },
  { symbol: "?",  ru: "Вопрос.?",     uk: "Питання",         en: "Question"    },
];

const SPEECH_LANG: Record<string, string> = {
  ru: "ru-RU", uk: "uk-UA", en: "en-US",
};

function speak(name: string, lang: string) {
  const path = `/audio/punctuation/${lang}/${encodeURIComponent(name)}.mp3`;
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

export default function PunctuationPage() {
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
          padding: "clamp(8px, 1.5vw, 16px)",
        }}
      >
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(5, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "clamp(4px, 0.8vw, 10px)",
          }}
        >
          {MARKS.map((m, i) => {
            const name = (m as Record<string, string>)[language] ?? m.ru;
            return (
              <button
                key={i}
                onClick={() => speak(name, language)}
                style={{
                  background: "rgba(255,255,255,0.14)",
                  border: "2px solid rgba(255,255,255,0.35)",
                  borderRadius: "clamp(8px, 1.5vw, 16px)",
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "clamp(2px, 0.5vw, 6px)",
                  padding: "clamp(4px, 0.8vw, 10px)",
                  transition: "background 0.15s, transform 0.1s",
                  userSelect: "none",
                  overflow: "hidden",
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.28)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.14)";
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
                }}
                onMouseDown={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
                }}
                onMouseUp={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
                }}
              >
                {/* Large punctuation symbol */}
                <span
                  style={{
                    color: "white",
                    fontWeight: 900,
                    fontSize: "clamp(2rem, 6vw, 5.5rem)",
                    fontFamily: "Georgia, 'Times New Roman', serif",
                    lineHeight: 1,
                    textShadow: "0 2px 8px rgba(0,0,0,0.4)",
                    letterSpacing: m.symbol === "()" ? "0.1em" : "normal",
                  }}
                >
                  {m.symbol}
                </span>
                {/* Name label */}
                <span
                  style={{
                    color: "rgba(255,255,255,0.88)",
                    fontWeight: 700,
                    fontSize: "clamp(0.55rem, 1.4vw, 1.1rem)",
                    fontFamily: "Montserrat, Arial, sans-serif",
                    lineHeight: 1.1,
                    textAlign: "center",
                    textShadow: "0 1px 4px rgba(0,0,0,0.3)",
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
