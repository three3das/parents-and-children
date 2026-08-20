import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useGoogleAuth } from "@/lib/auth/useGoogleAuth";

// --- Та же золотая палитра, что и в IshvaraPage.tsx (колесо сайта) ---
// GOLD/WHITE/mix() — идентичная формула, просто вычислена здесь один
// раз в константы, а не через функцию (страница не рисует секторов
// колеса, нужны только 4 конкретных оттенка).
const GOLD = { r: 255, g: 215, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

function mix(goldPct: number) {
  const r = Math.round(GOLD.r * goldPct + WHITE.r * (1 - goldPct));
  const g = Math.round(GOLD.g * goldPct + WHITE.g * (1 - goldPct));
  const b = Math.round(GOLD.b * goldPct + WHITE.b * (1 - goldPct));
  return `rgb(${r},${g},${b})`;
}

const COLOR_0 = mix(0); // чистый белый — фон карточки формы
const COLOR_33 = mix(0.33); // самый светлый золотой — используется для placeholder
const COLOR_67 = mix(0.67);
const COLOR_100 = mix(1.0); // чистое золото #FFD700 — акцентный цвет сайта

// Официальный многоцветный логотип "G" — это просто иконка Google,
// а не сама кнопка, поэтому его использование в кастомной кнопке
// допустимо (в отличие от перекраски renderButton()).
function GoogleGLogo() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.9 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21 21-9.4 21-21c0-1.2-.1-2.4-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.8 1.1 8 3l6-6C34.6 5.1 29.6 3 24 3c-7.5 0-14 4.1-17.7 10.2z"
      />
      <path
        fill="#4CAF50"
        d="M24 45c5.5 0 10.4-1.9 14.3-5.1l-6.6-5.6C29.6 36.1 26.9 37 24 37c-5.3 0-9.7-3.1-11.3-7.6l-6.5 5C9.9 40.6 16.4 45 24 45z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.3 4.3-4.2 5.7l6.6 5.6C41.5 36.1 44 30.6 44 24c0-1.2-.1-2.4-.4-3.5z"
      />
    </svg>
  );
}

export default function RegisterPage() {
  const [, navigate] = useLocation();
  const { register } = useAuth();
  const { promptGoogleSignIn, setExtraData, error: googleError, isLoading: googleLoading } = useGoogleAuth();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setExtraData({ name });
  }, [name, setExtraData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Введите имя");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
          firstName: name.trim(),
          lastName: ""
        }),
      });

      const data = await response.json();

      if (response.ok) {
        register(data.user);
        navigate('/');
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      {/* Цвет placeholder-текста нельзя задать через inline style —
          браузеры игнорируют style на псевдоэлементе ::placeholder,
          поэтому здесь отдельный <style>-блок с CSS-классом (тот же
          класс/цвет, что и на LoginPage.tsx — для консистентности). */}
      <style>{`
        .site-email-input::placeholder {
          color: ${COLOR_33};
          opacity: 1;
        }
      `}</style>
      <div
        style={{
          flex: 1,
          // Тот же градиент 33% → 67% → 100% золота, что и у секторов
          // колеса на главной странице сайта (IshvaraPage.tsx).
          background: `linear-gradient(160deg, ${COLOR_33} 0%, ${COLOR_67} 60%, ${COLOR_100} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
            // 0% золота — чистый белый, как фон карточек/кнопок сайта.
            background: COLOR_0,
            borderRadius: "20px",
            padding: "2.5rem",
            maxWidth: "440px",
            width: "100%",
            border: `3px solid ${COLOR_100}`,
            boxShadow: "0 20px 60px rgba(0,0,0,0.25)",
          }}
        >
          <h1
            style={{
              fontSize: "2rem",
              fontWeight: 800,
              color: COLOR_100,
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            Create Account
          </h1>

          {(error || googleError) && (
            <div
              style={{
                background: "#FEE2E2",
                border: "1px solid #FCA5A5",
                borderRadius: "8px",
                padding: "0.75rem",
                marginBottom: "1rem",
                color: "#DC2626",
                fontSize: "0.875rem",
              }}
            >
              {error || googleError}
            </div>
          )}

          <div style={{ marginBottom: "1rem" }}>
            <label
              style={{
                display: "block",
                fontSize: "0.875rem",
                fontWeight: "700",
                color: COLOR_100,
                marginBottom: "0.25rem",
              }}
            >
              Имя
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="site-email-input"
              style={{
                width: "100%",
                padding: "0.75rem",
                border: `1px solid ${COLOR_67}`,
                borderRadius: "8px",
                fontSize: "1rem",
                outline: "none",
                transition: "border-color 0.2s",
                color: COLOR_100,
              }}
              placeholder="Ваше имя"
              required
            />
          </div>

          {/* Кастомная золотая кнопка вместо renderButton() Google.
              Официальный виджет Google (window.google.accounts.id.renderButton)
              нельзя перекрасить в произвольный цвет — только их брендовые
              темы (outline / filled_blue / filled_black). Поэтому здесь
              своя кнопка в стиле сайта, которая по клику вызывает
              promptGoogleSignIn() из useGoogleAuth.ts.

              Нюанс: prompt() в Google Identity Services задуман для
              автоматического One Tap, а не как кнопка — если пользователь
              раньше уже закрывал такое окно, Google может временно
              (по нарастающей) молча не показывать его повторно, без
              явной ошибки. Официальный renderButton() от этого не страдает.
              Риск принят осознанно — см. обсуждение. */}
          <button
            type="button"
            onClick={() => promptGoogleSignIn()}
            disabled={googleLoading}
            style={{
              width: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem",
              background: COLOR_100,
              color: "#fff",
              border: `1px solid ${COLOR_100}`,
              borderRadius: "8px",
              padding: "0.75rem",
              fontSize: "1rem",
              fontWeight: 700,
              cursor: googleLoading ? "not-allowed" : "pointer",
              opacity: googleLoading ? 0.7 : 1,
              marginBottom: "1rem",
              boxShadow: "0 4px 14px rgba(255,215,0,0.35)",
            }}
          >
            <span
              style={{
                background: "#fff",
                borderRadius: "4px",
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              <GoogleGLogo />
            </span>
            {googleLoading ? "Зачекайте..." : "Зареєструватися через Google"}
          </button>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              margin: "1rem 0",
              color: COLOR_67,
              fontSize: "0.75rem",
            }}
          >
            <div style={{ flex: 1, height: "1px", background: COLOR_33 }} />
            или
            <div style={{ flex: 1, height: "1px", background: COLOR_33 }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "700",
                  color: COLOR_100,
                  marginBottom: "0.25rem",
                }}
              >
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="site-email-input"
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: `1px solid ${COLOR_67}`,
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  color: COLOR_100,
                }}
                placeholder="email@example.com"
                required
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "700",
                  color: COLOR_100,
                  marginBottom: "0.25rem",
                }}
              >
                Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "0.75rem",
                    paddingRight: "3rem",
                    border: `1px solid ${COLOR_67}`,
                    borderRadius: "8px",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s",
                    color: COLOR_100,
                  }}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "0.75rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: COLOR_100,
                    fontWeight: 700,
                    cursor: "pointer",
                  }}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "0.875rem",
                  fontWeight: "700",
                  color: COLOR_100,
                  marginBottom: "0.25rem",
                }}
              >
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: `1px solid ${COLOR_67}`,
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
                  color: COLOR_100,
                }}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || googleLoading}
              style={{
                background: COLOR_100,
                color: "#fff",
                border: "none",
                borderRadius: "12px",
                padding: "0.875rem",
                fontSize: "1rem",
                fontWeight: 700,
                cursor: isLoading ? "not-allowed" : "pointer",
                boxShadow: `0 4px 14px rgba(255,215,0,0.5)`,
                transition: "opacity 0.2s",
                opacity: isLoading ? 0.7 : 1,
              }}
            >
              {isLoading ? "Creating Account..." : "Create Account"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <p style={{ color: COLOR_67, fontSize: "0.875rem" }}>
              Already have an account?{" "}
              <button
                onClick={() => navigate("/login")}
                style={{
                  background: "none",
                  border: "none",
                  color: COLOR_100,
                  fontWeight: "700",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Sign In
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}