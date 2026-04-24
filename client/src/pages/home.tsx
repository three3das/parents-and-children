import { useState } from "react";
import { useLocation } from "wouter";
import { CATEGORIES } from "@/lib/categories";
import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

export default function HomePage() {
  const [, navigate] = useLocation();
  const { t, language } = useLanguage();
  const { isAuthenticated, user } = useAuth();
  const [modalType, setModalType] = useState<null | "unregistered" | "nosubscription">(null);

  const hasSubscription = user?.hasSubscription ?? false;

  const handleCategoryClick = (cat: typeof CATEGORIES[0], index: number) => {
    // Кнопка 1 (index 0) — всегда доступна
    if (index === 0) {
      navigate(cat.path);
      return;
    }
    // Кнопки 2–7 — проверяем регистрацию и подписку
    if (!isAuthenticated) {
      setModalType("unregistered");
      return;
    }
    if (!hasSubscription) {
      setModalType("nosubscription");
      return;
    }
    navigate(cat.path);
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <SiteHeader />

      <div
        style={{
          flex: 1,
          background: "linear-gradient(160deg, #FFE49A 0%, #FFCA5A 60%, #FFB830 100%)",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
        }}
      >
        {/* ── Rainbow icon row ── */}
        <div className="icons-row">
          {CATEGORIES.map((cat, index) => {
            const isLocked = index > 0 && (!isAuthenticated || !hasSubscription);

            return (
              <button
                key={cat.id}
                className="icon-btn"
                title={cat.label}
                aria-label={cat.label}
                onClick={() => handleCategoryClick(cat, index)}
                style={{
                  background: cat.gradient,
                  boxShadow: `0 6px 18px ${cat.shadow}`,
                  cursor: "pointer",
                  position: "relative",
                  overflow: "hidden",
                  padding: 0,
                }}
              >
                {/* Изображение на всю кнопку */}
                {cat.image ? (
                  <img
                    src={cat.image}
                    alt={cat.label}
                    style={{
                      position: "absolute",
                      top: "4%",
                      left: "10%",
                      width: "80%",
                      height: "74%",
                      objectFit: "contain",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  />
                ) : (
                  <span
                    className="icon-emoji"
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      transform: "translate(-50%, -62%)",
                      pointerEvents: "none",
                      userSelect: "none",
                    }}
                  >
                    {cat.emoji}
                  </span>
                )}

                {/* Подпись снизу */}
                <span
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: "22%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 900,
                    fontSize: "clamp(0.4rem, 1.3vw, 0.95rem)",
                    letterSpacing: "0.04em",
                    textShadow: "0 1px 6px rgba(0,0,0,0.55)",
                    lineHeight: 1,
                    pointerEvents: "none",
                    userSelect: "none",
                    background: "rgba(0,0,0,0.18)",
                  }}
                >
                  {cat.text ? cat.text[language] : cat.label}
                </span>

                {/*  Bol'shoy zamok s klyuchom dlya zablokirovannyh knopok */}
                {isLocked && (
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      background: "rgba(0,0,0,0.38)",
                      borderRadius: "inherit",
                      zIndex: 2,
                    }}
                  >
                    <div
                      style={{
                        animation: "keyRotate 4s ease-in-out infinite, keySparkle 2.5s ease-in-out infinite",
                        filter: "drop-shadow(0 0 15px gold) drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))",
                        transformOrigin: "center",
                        display: "inline-block",
                        userSelect: "none",
                        pointerEvents: "none",
                      }}
                    >
                      <svg width="120" height="120" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                        {/* Zamok */}
                        <g transform="translate(10, 20)">
                          {/* Osnovanie zamka */}
                          <rect x="5" y="30" width="50" height="30" fill={`url(#lockGradient${index})`} stroke="#B8860B" strokeWidth="2" rx="2" />

                          {/* Levaya bashnya */}
                          <rect x="0" y="20" width="10" height="40" fill={`url(#lockGradient${index})`} stroke="#B8860B" strokeWidth="2" />
                          {/* Levyy kupol */}
                          <ellipse cx="5" cy="20" rx="6" ry="8" fill={`url(#lockGradient${index})`} stroke="#B8860B" strokeWidth="2" />
                          <circle cx="5" cy="15" r="2" fill="#FFD700" />

                          {/* Pravaya bashnya */}
                          <rect x="50" y="20" width="10" height="40" fill={`url(#lockGradient${index})`} stroke="#B8860B" strokeWidth="2" />
                          {/* Pravyy kupol */}
                          <ellipse cx="55" cy="20" rx="6" ry="8" fill={`url(#lockGradient${index})`} stroke="#B8860B" strokeWidth="2" />
                          <circle cx="55" cy="15" r="2" fill="#FFD700" />

                          {/* Tsentralnaya bashnya */}
                          <rect x="22" y="25" width="16" height="35" fill={`url(#lockGradient${index})`} stroke="#B8860B" strokeWidth="2" />
                          {/* Tsentralnyy kupol */}
                          <ellipse cx="30" cy="25" rx="9" ry="10" fill={`url(#lockGradient${index})`} stroke="#B8860B" strokeWidth="2" />
                          <circle cx="30" cy="18" r="3" fill="#FFD700" />

                          {/* Vorota */}
                          <path d="M 24 40 Q 24 35 30 35 Q 36 35 36 40 L 36 60 L 24 60 Z" fill="#8B4513" stroke="#654321" strokeWidth="1" />

                          {/* Okna */}
                          <circle cx="8" cy="35" r="2" fill="#4A4A4A" />
                          <circle cx="52" cy="35" r="2" fill="#4A4A4A" />
                        </g>

                        {/* Klyuch */}
                        <g transform="translate(65, 35) rotate(-15)">
                          {/* Golovka klyucha */}
                          <circle cx="0" cy="0" r="8" fill="none" stroke="url(#goldGradient2)" strokeWidth="3" />
                          <circle cx="0" cy="0" r="5" fill="url(#goldGradient2)" />
                          {/* Sterzhen' */}
                          <rect x="-2" y="8" width="4" height="25" fill="url(#goldGradient2)" />
                          {/* Zubtsy - simmetrichnye */}
                          <rect x="-6" y="28" width="4" height="6" fill="url(#goldGradient2)" />
                          <rect x="2" y="28" width="4" height="6" fill="url(#goldGradient2)" />
                          <rect x="-6" y="35" width="4" height="4" fill="url(#goldGradient2)" />
                          <rect x="2" y="35" width="4" height="4" fill="url(#goldGradient2)" />
                        </g>

                        {/* Gradient */}
                        <defs>
                          {/* Золотой градиент для ключа */}
                          <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
                            <stop offset="50%" style={{ stopColor: "#FFA500", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
                          </linearGradient>
                          {/* Градиент замка - цвет кнопки */}
                          <linearGradient id={`lockGradient${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" style={{ stopColor: cat.gradient.match(/#[0-9A-Fa-f]{6}/g)?.[0] || "#FF5252", stopOpacity: 1 }} />
                            <stop offset="100%" style={{ stopColor: cat.gradient.match(/#[0-9A-Fa-f]{6}/g)?.[1] || "#E00000", stopOpacity: 1 }} />
                          </linearGradient>
                        </defs>
                      </svg>
                    </div>
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {/* ── Hero ── */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "2rem 1rem",
            textAlign: "center",
            gap: "1rem",
          }}
        >
          <h1
            style={{
              fontSize: "clamp(2rem, 8vw, 5.5rem)",
              fontWeight: 900,
              color: "#7A3A00",
              textShadow: "0 2px 8px rgba(0,0,0,0.15)",
              lineHeight: 1.15,
              letterSpacing: "-0.02em",
            }}
          >
            {t.home.title}
          </h1>
          <p
            style={{
              fontSize: "clamp(1rem, 3.5vw, 2rem)",
              fontWeight: 600,
              color: "#A05010",
              textShadow: "0 1px 4px rgba(0,0,0,0.10)",
            }}
          >
            {t.home.subtitle}
          </p>
          <div
            style={{
              height: "6px",
              width: "clamp(200px, 50vw, 480px)",
              borderRadius: "3px",
              background:
                "linear-gradient(90deg,#FF5252,#FF9F43,#FFE033,#2ECC71,#3EA6FF,#6C63FF,#C84BFF)",
              marginTop: "0.5rem",
              opacity: 0.75,
            }}
          />
        </div>
      </div>

      {/* ══════════════════════════════════════
          МОДАЛЬНЫЕ ОКНА
      ════════════════════════════════════════ */}
      {modalType && (
        <div
          onClick={() => setModalType(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: "1rem",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: "20px",
              padding: "2.5rem 2rem 2rem",
              maxWidth: "440px",
              width: "100%",
              textAlign: "center",
              boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
              position: "relative",
            }}
          >
            {/* Закрыть */}
            <button
              onClick={() => setModalType(null)}
              style={{
                position: "absolute",
                top: "1rem",
                right: "1rem",
                background: "none",
                border: "none",
                fontSize: "1.6rem",
                cursor: "pointer",
                color: "#aaa",
                lineHeight: 1,
              }}
            >
              ×
            </button>

            {/* Иконка */}
            <div
              style={{
                marginBottom: "1rem",
                lineHeight: 1,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: "5rem",
              }}
            >
              {modalType === "unregistered" ? (
                <div
                  style={{
                    animation: "keyRotate 4s ease-in-out infinite, keySparkle 2.5s ease-in-out infinite",
                    filter: "drop-shadow(0 0 15px gold) drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))",
                    transformOrigin: "center",
                    display: "inline-block",
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    {/* Замок */}
                    <g transform="translate(10, 20)">
                      {/* Основание замка */}
                      <rect x="5" y="25" width="50" height="35" fill="url(#goldGradient)" stroke="#B8860B" strokeWidth="2" />
                      {/* Башни */}
                      <rect x="0" y="15" width="10" height="45" fill="url(#goldGradient)" stroke="#B8860B" strokeWidth="2" />
                      <rect x="50" y="15" width="10" height="45" fill="url(#goldGradient)" stroke="#B8860B" strokeWidth="2" />
                      {/* Ворота */}
                      <rect x="20" y="35" width="20" height="25" fill="#8B4513" stroke="#654321" strokeWidth="1" />
                      {/* Окна */}
                      <circle cx="12" cy="25" r="3" fill="#4A4A4A" />
                      <circle cx="48" cy="25" r="3" fill="#4A4A4A" />
                      <circle cx="30" cy="30" r="2" fill="#4A4A4A" />
                    </g>

                    {/* Ключ */}
                    <g transform="translate(65, 35) rotate(-15)">
                      {/* Головка ключа */}
                      <circle cx="0" cy="0" r="8" fill="none" stroke="url(#goldGradient)" strokeWidth="3" />
                      <circle cx="0" cy="0" r="5" fill="url(#goldGradient)" />
                      {/* Стержень */}
                      <rect x="-2" y="8" width="4" height="25" fill="url(#goldGradient)" />
                      {/* Зубцы */}
                      <rect x="-6" y="28" width="4" height="6" fill="url(#goldGradient)" />
                      <rect x="2" y="30" width="4" height="4" fill="url(#goldGradient)" />
                      <rect x="-6" y="35" width="4" height="4" fill="url(#goldGradient)" />
                    </g>

                    {/* Градиент */}
                    <defs>
                      <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: "#FFA500", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              ) : (
                <div
                  style={{
                    animation: "keyRotate 4s ease-in-out infinite, keySparkle 2.5s ease-in-out infinite",
                    filter: "drop-shadow(0 0 15px gold) drop-shadow(0 0 30px rgba(255, 215, 0, 0.8))",
                    transformOrigin: "center",
                    display: "inline-block",
                  }}
                >
                  <svg width="80" height="80" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    {/* Замок */}
                    <g transform="translate(10, 20)">
                      {/* Основание замка */}
                      <rect x="5" y="25" width="50" height="35" fill="url(#goldGradient2)" stroke="#B8860B" strokeWidth="2" />
                      {/* Башни */}
                      <rect x="0" y="15" width="10" height="45" fill="url(#goldGradient2)" stroke="#B8860B" strokeWidth="2" />
                      <rect x="50" y="15" width="10" height="45" fill="url(#goldGradient2)" stroke="#B8860B" strokeWidth="2" />
                      {/* Ворота */}
                      <rect x="20" y="35" width="20" height="25" fill="#8B4513" stroke="#654321" strokeWidth="1" />
                      {/* Окна */}
                      <circle cx="12" cy="25" r="3" fill="#4A4A4A" />
                      <circle cx="48" cy="25" r="3" fill="#4A4A4A" />
                      <circle cx="30" cy="30" r="2" fill="#4A4A4A" />
                    </g>

                    {/* Ключ */}
                    <g transform="translate(65, 35) rotate(-15)">
                      {/* Головка ключа */}
                      <circle cx="0" cy="0" r="8" fill="none" stroke="url(#goldGradient2)" strokeWidth="3" />
                      <circle cx="0" cy="0" r="5" fill="url(#goldGradient2)" />
                      {/* Стержень */}
                      <rect x="-2" y="8" width="4" height="25" fill="url(#goldGradient2)" />
                      {/* Зубцы */}
                      <rect x="-6" y="28" width="4" height="6" fill="url(#goldGradient2)" />
                      <rect x="2" y="30" width="4" height="4" fill="url(#goldGradient2)" />
                      <rect x="-6" y="35" width="4" height="4" fill="url(#goldGradient2)" />
                    </g>

                    {/* Градиент */}
                    <defs>
                      <linearGradient id="goldGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
                        <stop offset="50%" style={{ stopColor: "#FFA500", stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: "#FFD700", stopOpacity: 1 }} />
                      </linearGradient>
                    </defs>
                  </svg>
                </div>
              )}
            </div>

            {/* Текст */}
            {modalType === "unregistered" ? (
              <>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: "#2D2D2D",
                    marginBottom: "0.75rem",
                    lineHeight: 1.3,
                  }}
                >
                  {t.modal.accessDenied}
                </h2>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "#555",
                    marginBottom: "1.75rem",
                    lineHeight: 1.6,
                  }}
                >
                  {t.modal.accessDeniedMessage}
                </p>
                <div style={{ display: "flex", gap: "0.75rem", justifyContent: "center", flexWrap: "wrap" }}>
                  <button
                    onClick={() => { setModalType(null); navigate("/register"); }}
                    style={{
                      background: "linear-gradient(135deg, #FF5252, #E00000)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "12px",
                      padding: "0.75rem 1.75rem",
                      fontSize: "1rem",
                      fontWeight: 800,
                      cursor: "pointer",
                      boxShadow: "0 4px 14px rgba(220,0,0,0.35)",
                    }}
                  >
                    {t.modal.register}
                  </button>
                  <button
                    onClick={() => { setModalType(null); navigate("/login"); }}
                    style={{
                      background: "transparent",
                      color: "#E00000",
                      border: "2px solid #E00000",
                      borderRadius: "12px",
                      padding: "0.75rem 1.75rem",
                      fontSize: "1rem",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {t.modal.signIn}
                  </button>
                </div>
              </>
            ) : (
              <>
                <h2
                  style={{
                    fontSize: "1.3rem",
                    fontWeight: 800,
                    color: "#2D2D2D",
                    marginBottom: "0.75rem",
                    lineHeight: 1.3,
                  }}
                >
                  {t.modal.subscriptionRequired}
                </h2>
                <p
                  style={{
                    fontSize: "1rem",
                    color: "#555",
                    marginBottom: "1.75rem",
                    lineHeight: 1.6,
                  }}
                >
                  {t.modal.subscriptionMessage}
                </p>
                <button
                  onClick={() => { setModalType(null); navigate("/subscription"); }}
                  style={{
                    background: "linear-gradient(135deg, #6C63FF, #3A33CC)",
                    color: "#fff",
                    border: "none",
                    borderRadius: "12px",
                    padding: "0.75rem 2rem",
                    fontSize: "1rem",
                    fontWeight: 800,
                    cursor: "pointer",
                    boxShadow: "0 4px 14px rgba(60,40,200,0.35)",
                  }}
                >
                  {t.modal.getSubscription}
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* CSS анимации */}
      <style>{`
        @keyframes keyRotate {
          0%, 100% { transform: rotate(-5deg) scale(1); }
          50% { transform: rotate(5deg) scale(1.05); }
        }
        
        @keyframes keySparkle {
          0%, 100% { filter: brightness(1) drop-shadow(0 0 10px gold) drop-shadow(0 0 20px rgba(255, 215, 0, 0.6)); }
          50% { filter: brightness(1.3) drop-shadow(0 0 15px gold) drop-shadow(0 0 30px rgba(255, 215, 0, 0.8)); }
        }
        
        @keyframes starPulse {
          0%, 100% { transform: scale(1); opacity: 0.9; }
          50% { transform: scale(1.1); opacity: 1; }
        }
        
        @keyframes smallKeyGlow {
          0%, 100% { 
            filter: drop-shadow(0 0 8px gold) drop-shadow(0 0 12px rgba(255, 215, 0, 0.6));
            transform: rotate(-15deg) scale(1);
          }
          50% { 
            filter: drop-shadow(0 0 12px gold) drop-shadow(0 0 18px rgba(255, 215, 0, 0.8));
            transform: rotate(-10deg) scale(1.05);
          }
        }
      `}</style>
    </div>
  );
}
