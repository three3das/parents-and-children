// ─── SiteHeader — shared header for all pages ────────────────────────────────
// Logo · LanguageSwitcher · AuthDropdown (with modals)

import { useState } from "react";
import { motion } from "framer-motion";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AuthDropdown } from "./AuthDropdown";
import { LoginModal } from "./LoginModal";
import { CreateAccountModal } from "./CreateAccountModal";
import { ProgressModal } from "./ProgressModal";
import { useAuth } from "@/lib/auth";

interface SiteHeaderProps {
  onBack?: () => void;
}

export function SiteHeader({ onBack }: SiteHeaderProps = {}) {
  const { user } = useAuth();

  const [showLogin, setShowLogin] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [showProgress, setShowProgress] = useState(false);

  const sessionId = user ? String(user.id) : "";

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        style={{
          width: "100%",
          background: "rgba(255,255,255,0.95)",
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
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <img
            src="/images/book.png"
            alt="logo"
            style={{ height: "clamp(1.8rem, 3.5vw, 2.6rem)", width: "auto", objectFit: "contain" }}
          />
          <span
            style={{
              fontSize: "clamp(0.95rem, 2.2vw, 1.35rem)",
              fontWeight: 800,
              background: "linear-gradient(135deg, #FF6B6B, #FF9F43, #FFE033, #2ECC71, #3EA6FF, #6C63FF, #C84BFF)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
              letterSpacing: "-0.02em",
              whiteSpace: "nowrap",
            }}
          >
            KnowledgeChildren
          </span>
        </div>

        {/* ── Right side: language + auth ── */}
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <LanguageSwitcher />
          <AuthDropdown
            onLoginClick={() => setShowLogin(true)}
            onCreateAccountClick={() => setShowCreate(true)}
            onProgressClick={user ? () => setShowProgress(true) : undefined}
          />
        </div>
      </motion.header>

      {/* ── Modals (self-contained) ── */}
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
