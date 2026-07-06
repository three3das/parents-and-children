// ─── SiteHeader — shared header for all pages ────────────────────────────────
// Logo · LanguageSwitcher · AuthDropdown (with modals)

import { useState } from "react";
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
    // Show P2P payment modal
    setShowP2PModal(true);

    /* COMMENTED OUT - NOWPayments integration (can be re-enabled later)
    try {
      const res = await fetch("/api/payments/create-invoice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan: "lifetime", userId: user.id }),
      });
      const data = await res.json();
      console.log("[SiteHeader] Response from server:", data);
      if (data.invoiceUrl) {
        console.log("[SiteHeader] Opening invoice URL:", data.invoiceUrl);
        window.open(data.invoiceUrl, "_blank");
      } else if (data.error) {
        alert(data.error);
      } else {
        console.error("[SiteHeader] No invoiceUrl in response:", data);
        alert("Не удалось получить ссылку на оплату");
      }
    } catch (err) {
      console.error("[SiteHeader] Error:", err);
      alert("Ошибка при создании инвойса. Попробуйте позже.");
    }
    */
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
        {/* ── Back button (optional) ── */}
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

        {/* ── Logo ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <img
            src="https://audioveda.ru/uploads/union/92/lechenie_dush_v_obschinah_vayshnavov.jpg"
            alt="Krishna"
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
              {language === "uk" ? "Знання для дітей" : "Знание для детей"}
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

        {/* ── Navigation buttons ── */}
        <nav style={{ display: "flex", gap: "6px", alignItems: "center" }}>
          <a
            href="ishvara.html"
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

        {/* ── Right side: language + auth ── */}
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

      {/* ── Modals (self-contained) ── */}
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
