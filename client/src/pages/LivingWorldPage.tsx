import { useLocation } from "wouter";
import { SiteHeader } from "@/components/SiteHeader";

const SECTIONS = [
  { emoji: "🌊", label: "Море" },
  { emoji: "🌿", label: "Растения" },
  { emoji: "🦋", label: "Насекомые" },
  { emoji: "🐦", label: "Птицы" },
  { emoji: "🐘", label: "Животные" },
  { emoji: "👨‍👩‍👧", label: "Люди" },
];

export default function LivingWorldPage() {
  const [, navigate] = useLocation();

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
        <div
          style={{
            flex: 1,
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
            gap: "clamp(4px, 0.8vw, 10px)",
          }}
        >
          {SECTIONS.map((s, i) => (
            <button
              key={i}
              style={{
                background: "rgba(255,255,255,0.15)",
                border: "2px solid rgba(255,255,255,0.35)",
                borderRadius: "clamp(8px, 1.5vw, 16px)",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(4px, 1vw, 12px)",
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
              <span style={{ fontSize: "clamp(2.5rem, 8vw, 6rem)", lineHeight: 1 }}>
                {s.emoji}
              </span>
              <span
                style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: "clamp(0.9rem, 2.5vw, 2rem)",
                  textShadow: "0 2px 6px rgba(0,0,0,0.3)",
                  fontFamily: "Montserrat, Arial, sans-serif",
                  lineHeight: 1,
                }}
              >
                {s.label}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
