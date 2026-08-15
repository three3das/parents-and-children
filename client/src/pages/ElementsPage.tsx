import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeaderFooter";

const ELEMENTS: { ru: string; uk: string; en: string; bg: string }[] = [
  { ru: "Воздух", uk: "Повітря",  en: "Air",    bg: "linear-gradient(135deg,#B3E5FC,#81D4FA)" },
  { ru: "Огонь",  uk: "Вогонь",   en: "Fire",   bg: "linear-gradient(135deg,#FF8C00,#FF3D00)" },
  { ru: "Эфир",   uk: "Ефір",     en: "Aether", bg: "linear-gradient(135deg,#CE93D8,#4A148C)" },
  { ru: "Земля",  uk: "Земля",    en: "Earth",  bg: "linear-gradient(135deg,#A5D6A7,#6D4C41)" },
  { ru: "Вода",   uk: "Вода",     en: "Water",  bg: "linear-gradient(135deg,#B3E5FC,#01579B)" },
];

const EMOJI = ["💨", "🔥", "✨", "🌍", "💧"];

const SPEECH_LANG: Record<string, string> = {
  ru: "ru-RU", uk: "uk-UA", en: "en-US",
};

function speak(name: string, lang: string) {
  const path = `/audio/elements/${lang}/${encodeURIComponent(name)}.mp3`;
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

export default function ElementsPage() {
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
        {/* Quincunx layout: 2 + 1 + 2 rows */}
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "clamp(4px,0.8vw,10px)" }}>
          {/* Row 1: Air + Fire */}
          <div style={{ flex: 1, display: "flex", gap: "clamp(4px,0.8vw,10px)" }}>
            {[0, 1].map((i) => <ElementBtn key={i} el={ELEMENTS[i]} emoji={EMOJI[i]} lang={language}/>)}
          </div>
          {/* Row 2: Aether (centred) */}
          <div style={{ flex: 1, display: "flex", justifyContent: "center" }}>
            <ElementBtn el={ELEMENTS[2]} emoji={EMOJI[2]} lang={language} style={{ flex: "0 0 48%" }}/>
          </div>
          {/* Row 3: Earth + Water */}
          <div style={{ flex: 1, display: "flex", gap: "clamp(4px,0.8vw,10px)" }}>
            {[3, 4].map((i) => <ElementBtn key={i} el={ELEMENTS[i]} emoji={EMOJI[i]} lang={language}/>)}
          </div>
        </div>
      </div>
    </div>
  );
}

function ElementBtn({
  el, emoji, lang, style,
}: {
  el: { ru: string; uk: string; en: string; bg: string };
  emoji: string;
  lang: string;
  style?: React.CSSProperties;
}) {
  const name = (el as Record<string, string>)[lang] ?? el.ru;
  return (
    <button
      onClick={() => speak(name, lang)}
      style={{
        flex: 1,
        background: el.bg,
        border: "3px solid rgba(255,255,255,0.45)",
        borderRadius: "clamp(8px,1.5vw,18px)",
        cursor: "pointer",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "clamp(4px,1vw,10px)",
        padding: 0,
        transition: "transform 0.12s, filter 0.12s",
        userSelect: "none",
        ...style,
      }}
      onMouseEnter={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
        (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.12)";
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
        (e.currentTarget as HTMLButtonElement).style.filter = "none";
      }}
      onMouseDown={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(0.95)";
      }}
      onMouseUp={(e) => {
        (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.07)";
      }}
    >
      <span style={{ fontSize: "clamp(2.2rem,7vw,5.5rem)", lineHeight: 1 }}>{emoji}</span>
      <span
        style={{
          color: "white",
          fontWeight: 900,
          fontSize: "clamp(1rem,2.8vw,2.5rem)",
          textShadow: "0 2px 6px rgba(0,0,0,0.35)",
          fontFamily: "Montserrat, Arial, sans-serif",
          lineHeight: 1,
        }}
      >
        {name}
      </span>
    </button>
  );
}
