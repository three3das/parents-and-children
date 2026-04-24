// ─── ReadingPage — Алфавит / ABC book / Алфавіт ──────────────────────────────
// Fetches words from kfc.words and displays them in the current language

import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { CATEGORIES } from "@/lib/categories";
import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage, type Language } from "@/lib/i18n";

interface KfcWord {
  id: string;
  ru: string;
  en: string;
  uk: string;
}

const category = CATEGORIES.find((c) => c.id === "reading")!;

// Rainbow palette for word cards
const CARD_COLORS = [
  { bg: "#FF5252", shadow: "rgba(220,0,0,0.30)" },
  { bg: "#FF9F43", shadow: "rgba(200,100,0,0.30)" },
  { bg: "#FFD700", shadow: "rgba(180,150,0,0.30)" },
  { bg: "#2ECC71", shadow: "rgba(0,150,70,0.30)" },
  { bg: "#3EA6FF", shadow: "rgba(0,80,210,0.30)" },
  { bg: "#6C63FF", shadow: "rgba(60,40,200,0.30)" },
  { bg: "#C84BFF", shadow: "rgba(130,0,200,0.30)" },
];

export default function ReadingPage() {
  const [, navigate] = useLocation();
  const { language } = useLanguage();

  const { data: words = [], isLoading } = useQuery<KfcWord[]>({
    queryKey: ["/api/kfc/words"],
    staleTime: 5 * 60 * 1000,
  });

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      {/* ── Header ── */}
      <SiteHeader />

      {/* ── Content area ── */}
      <div
        style={{
          flex: 1,
          background: category.bgGradient,
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          position: "relative",
        }}
      >
        {/* ── Back button ── */}
        <button
          onClick={() => navigate("/")}
          title="На главную"
          aria-label="На главную"
          style={{
            position: "absolute",
            top: "0.6rem",
            left: "0.6rem",
            zIndex: 10,
            background: "rgba(255,255,255,0.25)",
            border: "none",
            borderRadius: "50%",
            width: "clamp(34px, 4.5vw, 54px)",
            height: "clamp(34px, 4.5vw, 54px)",
            fontSize: "clamp(1rem, 2.2vw, 1.5rem)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(6px)",
            transition: "background 0.18s",
          }}
          onMouseEnter={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.42)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.25)")
          }
        >
          ←
        </button>

        {/* ── Sub-icon row ── */}
        <div className="icons-row">
          {category.subIcons.map((icon) => (
            <button
              key={icon.label}
              className="icon-btn"
              title={icon.label}
              aria-label={icon.label}
              onClick={() => (icon.images || icon.path) ? navigate(icon.path ?? "/alphabet") : undefined}
              style={{ background: icon.gradient, boxShadow: `0 6px 18px ${icon.shadow}`, position: "relative", overflow: "hidden" }}
            >
              {icon.images ? (
                <img
                  src={icon.images[language] || icon.images['ru']}
                  alt={icon.label}
                  style={{
                    position: "absolute",
                    top: 0, left: 0,
                    width: "100%", height: "100%",
                    objectFit: "cover",
                    borderRadius: "inherit",
                    pointerEvents: "none",
                  }}
                />
              ) : (
                <span className="icon-emoji">{icon.emoji}</span>
              )}
            </button>
          ))}
        </div>

        {/* ── Word cards ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexWrap: "wrap",
            gap: "1rem",
            padding: "1.5rem 1.5rem 2rem",
            alignContent: "flex-start",
            justifyContent: "center",
          }}
        >
          {isLoading && (
            <div style={{ color: "#fff", fontSize: "1.5rem", fontWeight: 700, marginTop: "3rem" }}>
              ...
            </div>
          )}
          {words.map((word, i) => {
            const color = CARD_COLORS[i % CARD_COLORS.length];
            const text = word[language as Language];
            return (
              <div
                key={word.id}
                style={{
                  background: color.bg,
                  boxShadow: `0 6px 20px ${color.shadow}`,
                  borderRadius: "16px",
                  padding: "1rem 2rem",
                  color: "#fff",
                  fontWeight: 800,
                  fontSize: "clamp(1.1rem, 2.5vw, 1.8rem)",
                  letterSpacing: "0.02em",
                  textShadow: "0 2px 6px rgba(0,0,0,0.25)",
                  cursor: "default",
                  userSelect: "none",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: "clamp(120px, 15vw, 200px)",
                }}
              >
                {text}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
