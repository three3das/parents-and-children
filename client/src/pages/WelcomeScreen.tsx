import { useEffect, useState } from "react";
import { useLocation } from "wouter";

// ============================================================================
// Первый экран после регистрации — полноэкранное фото Кришны с флейтой
// (мантра уже "запечена" в самой картинке, отдельной HTML-рамки нет —
// вариант А). Конфетти + текст поздравления поверх, автопереход на
// /choose-access через 5 секунд. Звук — best effort: браузеры блокируют
// автовоспроизведение без клика, поэтому пытаемся запустить сразу, а если
// браузер отказал — тихо ждём первого клика/тапа пользователя по экрану.
// ============================================================================

const AUDIO_SRC = "/audio/krishna.mp3";
const IMAGE_SRC = "/images/krishna.jpg";
const AUTO_ADVANCE_MS = 5000;

// Простые конфетти на CSS-анимации — без сторонних библиотек.
const CONFETTI_COLORS = ["#FFD700", "#FFFFFF", "#FFA500", "#FFEC8B"];
const CONFETTI_COUNT = 60;

function ConfettiPiece({ index }: { index: number }) {
  const left = Math.random() * 100;
  const delay = Math.random() * 1.5;
  const duration = 3 + Math.random() * 2;
  const size = 6 + Math.random() * 8;
  const color = CONFETTI_COLORS[index % CONFETTI_COLORS.length];
  const rotate = Math.random() * 360;

  return (
    <div
      style={{
        position: "absolute",
        top: "-5%",
        left: `${left}%`,
        width: size,
        height: size * 1.6,
        backgroundColor: color,
        opacity: 0.9,
        transform: `rotate(${rotate}deg)`,
        animation: `confetti-fall ${duration}s ease-in ${delay}s forwards`,
        borderRadius: 2,
      }}
    />
  );
}

export default function WelcomeScreen() {
  const [, navigate] = useLocation();
  const [audioBlocked, setAudioBlocked] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => navigate("/choose-access"), AUTO_ADVANCE_MS);
    return () => clearTimeout(timer);
  }, [navigate]);

  useEffect(() => {
    const audio = new Audio(AUDIO_SRC);
    audio.volume = 0.6;
    audio.play().catch(() => {
      // Браузер заблокировал автовоспроизведение без клика — покажем
      // ненавязчивую подсказку "нажмите, чтобы включить звук".
      setAudioBlocked(true);
    });

    const enableOnClick = () => {
      audio.play().catch(() => {});
      setAudioBlocked(false);
    };
    if (audioBlocked) {
      window.addEventListener("click", enableOnClick, { once: true });
    }

    return () => {
      audio.pause();
      window.removeEventListener("click", enableOnClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundImage: `url(${IMAGE_SRC})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes confetti-fall {
          0% { transform: translateY(0) rotate(0deg); opacity: 1; }
          100% { transform: translateY(110vh) rotate(360deg); opacity: 0; }
        }
      `}</style>

      {/* Конфетти поверх изображения */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {Array.from({ length: CONFETTI_COUNT }).map((_, i) => (
          <ConfettiPiece key={i} index={i} />
        ))}
      </div>

      {/* Текст поздравления внизу экрана, поверх затемняющей подложки,
          чтобы золотой текст на светлом фото оставался читаемым. */}
      <div
        style={{
          position: "relative",
          width: "100%",
          padding: "2rem 1.5rem 3rem",
          background: "linear-gradient(to top, rgba(0,0,0,0.55), rgba(0,0,0,0))",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: "#FFD700",
            fontWeight: 800,
            fontSize: "clamp(1.25rem, 4vw, 2rem)",
            textShadow: "0 2px 8px rgba(0,0,0,0.6)",
            margin: 0,
          }}
        >
          Поздравляем Вас с регистрацией на сайте!
        </p>

        {audioBlocked && (
          <p
            style={{
              color: "#FFFFFF",
              opacity: 0.85,
              fontSize: "0.875rem",
              marginTop: "0.75rem",
            }}
          >
            Нажмите в любом месте экрана, чтобы включить музыку
          </p>
        )}
      </div>
    </div>
  );
}