import { useLocation } from "wouter";
import { useLanguage } from "@/lib/i18n";
import { SiteHeader } from "@/components/SiteHeaderFooter";

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

// ── Note staff positions (treble clef, C4–B4) ────────────────────────────────
//
//  viewBox 0 0 100 72
//  5 staff lines at y = 16, 24, 32, 40, 48  (spacing = 8)
//    line 5 (F5): y=16   line 4 (D5): y=24   line 3 (B4): y=32
//    line 2 (G4): y=40   line 1 (E4): y=48
//  Note head y-centers:
//    0 C4 = ledger line below staff:  y=56
//    1 D4 = space below line 1:       y=52
//    2 E4 = line 1:                   y=48
//    3 F4 = space 1:                  y=44
//    4 G4 = line 2:                   y=40
//    5 A4 = space 2:                  y=36
//    6 B4 = line 3 (middle):          y=32

const STAFF_LINES = [48, 40, 32, 24, 16]; // y of each line, E→F (bottom→top)
const NOTE_Y      = [56, 52, 48, 44, 40, 36, 32]; // C D E F G A B

function NoteStaff({ noteIndex }: { noteIndex: number }) {
  const ny  = NOTE_Y[noteIndex];
  const nx  = 76;
  const sx  = nx + 5;       // stem x (right edge of head)
  const sy  = ny - 26;      // stem top
  const ledger = noteIndex === 0; // only C4 needs a ledger line

  return (
    <svg
      viewBox="0 0 100 72"
      width="100%"
      height="100%"
      style={{ display: "block" }}
    >
      {/* Staff lines */}
      <g stroke="white" strokeWidth="1.5" opacity="0.80">
        {STAFF_LINES.map((y, i) => (
          <line key={i} x1="22" y1={y} x2="98" y2={y} />
        ))}
      </g>

      {/* Treble clef — U+1D11E, serif so the glyph is available */}
      <text
        x="1"
        y="54"
        fontSize="40"
        fontFamily="'Times New Roman', Georgia, serif"
        fill="white"
        opacity="0.95"
      >
        {"𝄞"}
      </text>

      {/* Ledger line for middle C */}
      {ledger && (
        <line
          x1={nx - 8}
          y1={56}
          x2={nx + 8}
          y2={56}
          stroke="white"
          strokeWidth="1.5"
          opacity="0.85"
        />
      )}

      {/* Note head */}
      <ellipse
        cx={nx}
        cy={ny}
        rx="5.5"
        ry="3.8"
        fill="white"
        transform={`rotate(-15 ${nx} ${ny})`}
      />

      {/* Stem (upward) */}
      <line x1={sx} y1={ny - 2} x2={sx} y2={sy} stroke="white" strokeWidth="1.5" />
    </svg>
  );
}

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
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "clamp(2px, 0.4vw, 6px)",
                padding: "clamp(4px, 0.8vw, 10px)",
                transition: "background 0.15s, transform 0.1s",
                userSelect: "none",
                overflow: "hidden",
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
              {/* Mini staff with treble clef + note */}
              <div style={{ width: "100%", flex: "0 0 clamp(36px, 7vw, 64px)" }}>
                <NoteStaff noteIndex={i} />
              </div>

              {/* Note name */}
              <span
                style={{
                  color: "white",
                  fontWeight: 900,
                  fontSize: "clamp(1.2rem, 3.5vw, 3rem)",
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
