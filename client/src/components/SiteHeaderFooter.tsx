// ─── SiteHeaderFooter.tsx ──────────────────────────────────────────────────
// Объединённый файл: полные SiteHeader/SiteFooter (логотип, авторизация,
// инфо-карточки — используются на большинстве страниц) и упрощённые
// WheelHeader/WheelFooter + WheelPageShell для страниц-«колёс»
// (PaymentsPage, IshvaraPage и т.п.).

import { type ReactNode, useEffect, useRef, useState } from "react";
import type { NavItem } from "@/lib/siteNav";
import { LanguageScriptMenuPanel } from "@/components/LanguageScriptMenuPanel";

// ═══ SiteHeader — полный хедер (логотип, языки, авторизация) ═══
// ─── SiteHeader — shared header for all pages ────────────────────────────────
// Logo · LanguageSwitcher · AuthDropdown (with modals)

import { motion } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AuthDropdown } from "./AuthDropdown";
import { LoginModal } from "./LoginModal";
import { CreateAccountModal } from "./CreateAccountModal";
import { ProgressModal } from "./ProgressModal";
import { P2PPaymentModal } from "./P2PPaymentModal";
import { useAuth } from "@/lib/auth";
import { useLanguage } from "@/lib/i18n";

interface SiteHeaderProps {
  onBack?: () => void;
}

export function SiteHeader({ onBack }: SiteHeaderProps = {}) {
  const { user } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showProgress, setShowProgress] = useState(false);
  const [showP2PModal, setShowP2PModal] = useState(false);

  const sessionId = user ? String(user.id) : "";
  const { language } = useLanguage();

  const handleSubscribeClick = async () => {
    if (!user) {
      setShowLogin(true);
      return;
    }
    setShowP2PModal(true);
  };

  const handleIshvaraClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const targetUrl = "ishvara.html";

    fetch('/api/audio/ishvara')
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json();
      })
      .then((data) => {
        const audio = new Audio(data.path);
        audio.play().catch((err) => console.error("Ошибка воспроизведения:", err));
      })
      .catch((err) => console.error("Ошибка получения пути к аудио:", err))
      .finally(() => {
        setTimeout(() => {
          window.location.href = targetUrl;
        }, 2000);
      });
  };

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          width: "100%",
          background: "#ffffff",
          backdropFilter: "blur(10px)",
          boxShadow: "0 2px 12px rgba(0,0,0,0.10)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0.5rem 1rem",
          zIndex: 100,
          position: "relative",
        }}
      >
        {onBack && (
          <button
            onClick={onBack}
            style={{
              background: "rgba(0,0,0,0.08)",
              border: "none",
              borderRadius: "50%",
              width: "clamp(30px, 3.5vw, 42px)",
              height: "clamp(30px, 3.5vw, 42px)",
              fontSize: "clamp(0.9rem, 1.8vw, 1.2rem)",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            ←
          </button>
        )}

        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <img
            src="/images/logo.png"
            alt="logo"
            style={{
              width: "96px",
              height: "96px",
              borderRadius: "27px",
              objectFit: "cover",
              border: "6px solid #FFD700",
              boxSizing: "border-box"
            }}
          />
          <div>
            <div
              style={{
                margin: "0 0 6px",
                color: "#FFD700",
                fontSize: "1rem",
                fontWeight: 700,
                letterSpacing: "0.01em",
              }}
            >
              {language === "uk" ? "Знання для дітей" : "Совершенное знание"}
            </div>
            <p
              style={{
                margin: 0,
                color: "#FFD700",
                fontSize: "1rem",
                fontWeight: 700,
              }}
            >
              {language === "uk" ? "Освітній сайт" : "Образовательный сайт"}            </p>
          </div>
        </div>

        <nav style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <a
            href="ishvara.html"
            onClick={handleIshvaraClick}
            style={{
              minWidth: "120px",
              height: "50px",
              borderRadius: "12px",
              border: "4px solid #FFD700",
              background: "#ffffff",
              color: "#FFD700",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              padding: "8px 8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFD700";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#FFD700";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {language === "ru" ? "Верховний повелитель" : language === "uk" ? "Верховний володар" : "Ишвара"}
          </a>

          <a
            href="jiva.html"
            style={{
              minWidth: "120px",
              height: "50px",
              borderRadius: "12px",
              border: "4px solid #FFD700",
              background: "#ffffff",
              color: "#FFD700",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              padding: "8px 8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFD700";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#FFD700";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {language === "ru" ? "Живое существо" : language === "uk" ? "Жива істота" : "Джива"}
          </a>

          <a
            href="prakriti.html"
            style={{
              minWidth: "120px",
              height: "50px",
              borderRadius: "12px",
              border: "4px solid #FFD700",
              background: "#ffffff",
              color: "#FFD700",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              padding: "8px 8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFD700";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#FFD700";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {language === "ru" ? "Материальная природа" : language === "uk" ? "Матеріальна природа" : "Пракрити"}
          </a>

          <a
            href="karma.html"
            style={{
              minWidth: "120px",
              height: "50px",
              borderRadius: "12px",
              border: "4px solid #FFD700",
              background: "#ffffff",
              color: "#FFD700",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              padding: "8px 8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFD700";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#FFD700";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {language === "ru" ? "Деятельность" : language === "uk" ? "Діяльність" : "Карма"}
          </a>

          <a
            href="kala.html"
            style={{
              minWidth: "120px",
              height: "50px",
              borderRadius: "12px",
              border: "4px solid #FFD700",
              background: "#ffffff",
              color: "#FFD700",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: "pointer",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textDecoration: "none",
              padding: "8px 8px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#FFD700";
              e.currentTarget.style.color = "#ffffff";
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 4px 12px rgba(255, 215, 0, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#ffffff";
              e.currentTarget.style.color = "#FFD700";
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            {language === "ru" ? "Всепоглощающее время" : language === "uk" ? "Всепоглинаючий час" : "Кала"}
          </a>
        </nav>

        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <LanguageSwitcher />
          <AuthDropdown
            onLoginClick={() => setShowLogin(true)}
            onCreateAccountClick={() => setShowCreate(true)}
            onProgressClick={user ? () => setShowProgress(true) : undefined}
            onSubscribeClick={handleSubscribeClick}
          />
        </div>
      </motion.header>

      <P2PPaymentModal
        isOpen={showP2PModal}
        onClose={() => setShowP2PModal(false)}
        userEmail={user?.email || ""}
      />
      <ProgressModal
        isOpen={showProgress}
        onClose={() => setShowProgress(false)}
        sessionId={sessionId}
      />
      <LoginModal
        isOpen={showLogin}
        onClose={() => setShowLogin(false)}
        onSwitchToCreateAccount={() => {
          setShowLogin(false);
          setShowCreate(true);
        }}
      />
      <CreateAccountModal
        isOpen={showCreate}
        onClose={() => setShowCreate(false)}
        onSwitchToLogin={() => {
          setShowCreate(false);
          setShowLogin(true);
        }}
      />
    </>
  );
}

// ═══ SiteFooter — информационный футер (используется на home.tsx) ═══

export function SiteFooter() {
  return (
    <footer
      style={{
        width: "100%",
        padding: "22px 24px",
        textAlign: "center",
        fontSize: "0.95rem",
        background: "#ffffff",
        borderTop: "1px solid rgba(240, 240, 240, 0.9)",
      }}
    >
      <section
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "20px",
          marginBottom: "40px",
        }}
        className="cards-grid"
      >
        <article
          style={{
            padding: "26px",
            borderRadius: "24px",
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "14px",
              fontSize: "1.15rem",
              color: "#2D2D2D",
            }}
          >
            Мобильная версия
          </h3>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
            Интерфейс адаптируется для смартфонов, планшетов и экранов с любой
            шириной.
          </p>
        </article>

        <article
          style={{
            padding: "26px",
            borderRadius: "24px",
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "14px",
              fontSize: "1.15rem",
              color: "#2D2D2D",
            }}
          >
            Компьютерная версия
          </h3>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
            Широкие блоки контента, удобная навигация и понятный дизайн на
            больших экранах.
          </p>
        </article>

        <article
          style={{
            padding: "26px",
            borderRadius: "24px",
            background: "white",
            border: "1px solid #e2e8f0",
            boxShadow: "0 12px 30px rgba(15, 23, 42, 0.04)",
          }}
        >
          <h3
            style={{
              marginTop: 0,
              marginBottom: "14px",
              fontSize: "1.15rem",
              color: "#2D2D2D",
            }}
          >
            Языковое меню
          </h3>
          <p style={{ margin: 0, color: "#555", lineHeight: 1.6 }}>
            Список языков в алфавитном порядке с особым первым местом для
            санскрита.
          </p>
        </article>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .cards-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </footer>
  );
}

// ═══ WheelHeader / WheelFooter / WheelPageShell — для страниц-колёс ═══
const GOLD_ACTIVE = "#FFD700";
const GOLD_INACTIVE = "#FFE066";

export function WheelHeader({
  items,
  activeKey,
  onSelect,
}: {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  return (
    <header className="flex-shrink-0 w-full px-6 py-2 border-b border-yellow-200">
      <nav className="flex w-full gap-[0.5cm]">
        {items.map((item) => (
          <button
            key={item.key}
            onClick={() => onSelect(item.key)}
            className="flex-1 px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
            style={{
              color: GOLD_ACTIVE,
              borderColor: activeKey === item.key ? GOLD_ACTIVE : GOLD_INACTIVE,
            }}
          >
            {item.label}
          </button>
        ))}
      </nav>
    </header>
  );
}

// WheelFooter — та же панель кнопок, что и раньше, но теперь кнопка с
// key === "languages" ("Меню") сама открывает выпадашку с
// LanguageScriptMenuPanel внутри — это тот самый компонент
// последовательного выбора (Шаги 0/2/4), который раньше был
// захардкожен прямо в IshvaraPage.tsx. Перенос сюда даёт эту кнопку
// автоматически любой странице, использующей WheelFooter (не только
// IshvaraPage).
export function WheelFooter({
  items,
  activeKey,
  onSelect,
}: {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  return (
    <footer className="flex-shrink-0 w-full px-6 py-2 border-t border-yellow-200">
      <nav className="flex w-full gap-[0.5cm]">
        {items.map((item) => {
          const isMenuButton = item.key === "languages";
          return (
            <div
              key={item.key}
              className="flex-1 relative"
              ref={isMenuButton ? menuRef : undefined}
            >
              <button
                onClick={() => {
                  if (isMenuButton) {
                    setIsMenuOpen((open) => !open);
                  }
                  onSelect(item.key);
                }}
                className="w-full px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
                style={{
                  color: GOLD_ACTIVE,
                  borderColor:
                    activeKey === item.key ? GOLD_ACTIVE : GOLD_INACTIVE,
                }}
              >
                {item.label}
              </button>

              {isMenuButton && isMenuOpen && (
                <div
                  className="absolute bottom-full right-0 mb-2 w-64 rounded-2xl border-2 bg-white shadow-lg overflow-hidden z-10"
                  style={{ borderColor: GOLD_ACTIVE }}
                >
                  <LanguageScriptMenuPanel />
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </footer>
  );
}

export function WheelPageShell({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  return (
    <div
      className="h-screen w-screen flex flex-col bg-white overflow-hidden"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      {header}
      <main className="flex-1 min-h-0 flex flex-col items-center gap-2 py-2 overflow-hidden">
        {children}
      </main>
      {footer}
    </div>
  );
}