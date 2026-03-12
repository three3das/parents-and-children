import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeader";

// ── Alphabet data ─────────────────────────────────────────────────────────────

const ALPHABETS: Record<string, [string, string][]> = {
  ru: [
    ['А','а'],['Б','б'],['В','в'],['Г','г'],['Д','д'],['Е','е'],['Ё','ё'],
    ['Ж','ж'],['З','з'],['И','и'],['Й','й'],['К','к'],['Л','л'],['М','м'],
    ['Н','н'],['О','о'],['П','п'],['Р','р'],['С','с'],['Т','т'],['У','у'],
    ['Ф','ф'],['Х','х'],['Ц','ц'],['Ч','ч'],['Ш','ш'],['Щ','щ'],['Ъ','ъ'],
    ['Ы','ы'],['Ь','ь'],['Э','э'],['Ю','ю'],['Я','я'],
  ],
  uk: [
    ['А','а'],['Б','б'],['В','в'],['Г','г'],['Ґ','ґ'],['Д','д'],['Е','е'],
    ['Є','є'],['Ж','ж'],['З','з'],['И','и'],['І','і'],['Ї','ї'],['Й','й'],
    ['К','к'],['Л','л'],['М','м'],['Н','н'],['О','о'],['П','п'],['Р','р'],
    ['С','с'],['Т','т'],['У','у'],['Ф','ф'],['Х','х'],['Ц','ц'],['Ч','ч'],
    ['Ш','ш'],['Щ','щ'],['Ь','ь'],['Ю','ю'],['Я','я'],
  ],
  en: [
    ['A','a'],['B','b'],['C','c'],['D','d'],['E','e'],['F','f'],
    ['G','g'],['H','h'],['I','i'],['J','j'],['K','k'],['L','l'],
    ['M','m'],['N','n'],['O','o'],['P','p'],['Q','q'],['R','r'],
    ['S','s'],['T','t'],['U','u'],['V','v'],['W','w'],['X','x'],
    ['Y','y'],['Z','z'],
  ],
};

// Audio folder per language
const AUDIO_FOLDER: Record<string, string> = {
  ru: 'рос',
  uk: 'укр',
  en: 'en',
};

// Speech synthesis lang per language
const SPEECH_LANG: Record<string, string> = {
  ru: 'ru-RU',
  uk: 'uk-UA',
  en: 'en-US',
};

// Grid columns per language
const COLS: Record<string, number> = { ru: 7, uk: 7, en: 6 };

// ── Audio playback ────────────────────────────────────────────────────────────

function playLetter(letter: string, lang: string) {
  const folder = AUDIO_FOLDER[lang] ?? 'рос';
  const path = `/audio/letters/${folder}/${letter.toUpperCase()}.mp3`;
  const audio = new Audio(path);
  audio.play().catch(() => {
    // Fallback to speech synthesis
    try {
      const u = new SpeechSynthesisUtterance(letter);
      u.lang = SPEECH_LANG[lang] ?? 'ru-RU';
      u.rate = 0.7;
      speechSynthesis.speak(u);
    } catch {}
  });
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AlphabetPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();

  const pairs = ALPHABETS[language] ?? ALPHABETS.ru;
  const cols = COLS[language] ?? 7;

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
          position: "relative",
          padding: "clamp(10px, 2vw, 20px)",
          paddingTop: "clamp(10px, 2vw, 20px)",
        }}
      >
        {/* Letter grid */}
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, 1fr)`,
            gridTemplateRows: "repeat(5, 1fr)",
            gap: "clamp(4px, 0.8vw, 10px)",
          }}
        >
          {pairs.map(([upper, lower]) => (
            <button
              key={upper}
              onClick={() => playLetter(upper, language)}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.35)",
                borderRadius: "clamp(8px, 1.5vw, 16px)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                padding: 0,
                transition: "background 0.15s, transform 0.1s",
                userSelect: "none",
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.30)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.15)";
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              }}
              onMouseDown={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
              }}
              onMouseUp={e => {
                (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
              }}
            >
              <div style={{ lineHeight: 1, whiteSpace: "nowrap" }}>
                <span style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: "clamp(1.2rem, 3.5vw, 3rem)",
                  textShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  verticalAlign: "baseline",
                }}>
                  {upper}
                </span>
                <span style={{
                  color: "rgba(255,255,255,0.80)",
                  fontWeight: 700,
                  fontSize: "clamp(0.9rem, 2.6vw, 2.2rem)",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  verticalAlign: "baseline",
                  marginLeft: "0.1em",
                }}>
                  {lower}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
