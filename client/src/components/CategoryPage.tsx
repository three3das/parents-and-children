// ─── CategoryPage — reusable template for all 7 category pages ───────────────
// Props: one Category object from lib/categories.ts

import { useLocation } from "wouter";
import type { Category } from "@/lib/categories";
import { SiteHeader } from "./SiteHeader";

interface Props {
  category: Category;
}

export default function CategoryPage({ category }: Props) {
  const [, navigate] = useLocation();

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* ── Header ── */}
      <SiteHeader />

      {/* ── Coloured content area ── */}
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
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.42)")
          }
          onMouseLeave={(e) =>
            ((e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.25)")
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
              style={{
                background: icon.gradient,
                boxShadow: `0 6px 18px ${icon.shadow}`,
              }}
            >
              <span className="icon-emoji">{icon.emoji}</span>
            </button>
          ))}
        </div>

        {/* ── Centre: big floating emoji ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
            textAlign: "center",
            gap: "1.5rem",
          }}
        >
          <div
            style={{
              fontSize: "clamp(6rem, 20vw, 14rem)",
              lineHeight: 1,
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.28))",
              animation: "cat-float 3s ease-in-out infinite",
            }}
          >
            {category.emoji}
          </div>

          {/* ── Rainbow strip ── */}
          <div
            style={{
              height: "6px",
              width: "clamp(200px, 50vw, 480px)",
              borderRadius: "3px",
              background:
                "linear-gradient(90deg,#FF5252,#FF9F43,#FFE033,#2ECC71,#3EA6FF,#6C63FF,#C84BFF)",
              opacity: 0.85,
            }}
          />
        </div>
      </div>

      <style>{`
        @keyframes cat-float {
          0%, 100% { transform: translateY(0px);   }
          50%       { transform: translateY(-14px); }
        }
      `}</style>
    </div>
  );
}
