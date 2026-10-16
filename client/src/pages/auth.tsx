import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { useAuth, getWelcomeName } from "@/lib/auth";
import { useGoogleAuth } from "@/lib/auth/useGoogleAuth";
import { WHEEL_TEXT_COLOR } from "@/lib/colors";

// Страница «Регистрация и авторизация» (кнопка на заставке ведёт сюда).
//
// Две вкладки на одном экране:
//   • «Регистрация» — имя, почта, пароль + кнопка Google;
//   • «Вход» — почта и пароль + кнопка Google (для тех, кто уже
//     зарегистрирован на сайте).
//
// После успешного входа/регистрации (в том числе через Google)
// пользователь попадает на колесо домашней страницы, где показывается
// приветственное окно (параметр welcome=1, см. HomePage.tsx).
//
// Если человек уже вошёл, вместо форм показывается карточка
// «Вы вошли как …» с кнопками «Продолжить» и «Выйти».
//
// Запросы идут на те же адреса, что и в login.tsx / register.tsx:
// /api/auth/login и /api/auth/register. Эти две страницы не изменены.

const GOLD = "#FFD700";
const GOLD_SOFT = "#FFF3B0";
const AFTER_AUTH_URL = "/?skipSplash=true&welcome=1";

type Tab = "register" | "login";

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

const pillButton: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem 1rem",
  borderRadius: "9999px",
  border: `2px solid ${GOLD}`,
  background: "#fff",
  color: WHEEL_TEXT_COLOR,
  fontSize: "1rem",
  fontWeight: 700,
  cursor: "pointer",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "0.875rem",
  fontWeight: 700,
  color: WHEEL_TEXT_COLOR,
  marginBottom: "0.25rem",
};

// font-size 16px — чтобы iPhone не увеличивал страницу при фокусе в поле.
const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "0.75rem",
  border: `2px solid ${GOLD}`,
  borderRadius: "12px",
  fontSize: "16px",
  outline: "none",
  color: WHEEL_TEXT_COLOR,
  background: "#fff",
};

export default function AuthPage() {
  const [, navigate] = useLocation();
  const { user, isAuthenticated, isLoading, login, register, logout } = useAuth();
  const { promptGoogleSignIn, setExtraData, error: googleError, isLoading: googleLoading } =
    useGoogleAuth();

  const [tab, setTab] = useState<Tab>("register");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Был ли человек уже вошёл в момент открытия страницы. null — ещё
  // не знаем (идёт загрузка состояния авторизации).
  const [alreadyIn, setAlreadyIn] = useState<boolean | null>(null);

  useEffect(() => {
    if (!isLoading && alreadyIn === null) {
      setAlreadyIn(isAuthenticated);
    }
  }, [isLoading, isAuthenticated, alreadyIn]);

  // Человек вошёл или зарегистрировался на этой странице (почта или
  // Google) → колесо домашней страницы + приветственное окно.
  useEffect(() => {
    if (isAuthenticated && alreadyIn === false) {
      navigate(AFTER_AUTH_URL);
    }
  }, [isAuthenticated, alreadyIn, navigate]);

  // Имя для регистрации через Google (как в register.tsx).
  useEffect(() => {
    setExtraData(tab === "register" ? { name } : {});
  }, [tab, name, setExtraData]);

  const switchTab = (next: Tab) => {
    setTab(next);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (tab === "register") {
      if (!name.trim()) {
        setError("Введите имя");
        return;
      }
      if (password !== confirmPassword) {
        setError("Пароли не совпадают");
        return;
      }
    }

    setSubmitting(true);
    try {
      const response = await fetch(
        tab === "register" ? "/api/auth/register" : "/api/auth/login",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(
            tab === "register"
              ? { email, password, firstName: name.trim(), lastName: "" }
              : { email, password }
          ),
        }
      );
      const data = await response.json();

      if (response.ok) {
        // Дальше переход выполняет useEffect выше.
        if (tab === "register") register(data.user);
        else login(data.user);
      } else {
        setError(
          data.message ||
            (tab === "register"
              ? "Не удалось зарегистрироваться"
              : "Неверная почта или пароль")
        );
      }
    } catch (err) {
      console.error("Auth error:", err);
      setError("Не удалось связаться с сервером");
    } finally {
      setSubmitting(false);
    }
  };

  const shownError = error || googleError;
  const busy = submitting || googleLoading;

  return (
    <div
      style={{
        minHeight: "100vh",
        width: "100%",
        background: "#fff",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "1rem",
      }}
    >
      <div style={{ width: "100%", maxWidth: "440px" }}>
        <button
          type="button"
          onClick={() => navigate("/")}
          style={{
            background: "none",
            border: "none",
            color: WHEEL_TEXT_COLOR,
            fontWeight: 700,
            fontSize: "1rem",
            cursor: "pointer",
            padding: "0.5rem 0",
          }}
        >
          ← Назад
        </button>

        <h1
          style={{
            fontSize: "1.5rem",
            fontWeight: 800,
            color: WHEEL_TEXT_COLOR,
            textAlign: "center",
            margin: "0.5rem 0 1.25rem",
          }}
        >
          Регистрация и авторизация
        </h1>

        {alreadyIn === null && (
          <p style={{ textAlign: "center", color: WHEEL_TEXT_COLOR }}>Загрузка…</p>
        )}

        {/* Человек уже вошёл: карточка вместо форм. */}
        {alreadyIn === true && isAuthenticated && (
          <div
            style={{
              border: `3px solid ${GOLD}`,
              borderRadius: "20px",
              padding: "1.5rem",
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              textAlign: "center",
            }}
          >
            <p style={{ color: WHEEL_TEXT_COLOR, fontWeight: 700, fontSize: "1.125rem" }}>
              Вы вошли как {getWelcomeName(user)}
            </p>
            <button
              type="button"
              style={pillButton}
              onClick={() => navigate("/?skipSplash=true")}
            >
              Продолжить
            </button>
            <button
              type="button"
              style={pillButton}
              onClick={() => {
                logout();
                setAlreadyIn(false);
              }}
            >
              Выйти
            </button>
          </div>
        )}

        {/* Формы регистрации и входа. */}
        {alreadyIn !== null && !isAuthenticated && (
          <div
            style={{
              border: `3px solid ${GOLD}`,
              borderRadius: "20px",
              padding: "1.25rem",
            }}
          >
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1.25rem" }}>
              {(
                [
                  ["register", "Регистрация"],
                  ["login", "Вход"],
                ] as const
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => switchTab(key)}
                  aria-pressed={tab === key}
                  style={{
                    ...pillButton,
                    background: tab === key ? GOLD_SOFT : "#fff",
                  }}
                >
                  {label}
                </button>
              ))}
            </div>

            {shownError && (
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
                {shownError}
              </div>
            )}

            <button
              type="button"
              onClick={() => promptGoogleSignIn()}
              disabled={busy}
              style={{
                ...pillButton,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.75rem",
                opacity: busy ? 0.7 : 1,
                cursor: busy ? "not-allowed" : "pointer",
              }}
            >
              <GoogleGLogo />
              {googleLoading
                ? "Подождите…"
                : tab === "register"
                  ? "Зарегистрироваться через Google"
                  : "Войти через Google"}
            </button>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                margin: "1rem 0",
                color: WHEEL_TEXT_COLOR,
                fontSize: "0.875rem",
              }}
            >
              <div style={{ flex: 1, height: "1px", background: GOLD }} />
              или по почте
              <div style={{ flex: 1, height: "1px", background: GOLD }} />
            </div>

            <form
              onSubmit={handleSubmit}
              style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
            >
              {tab === "register" && (
                <div>
                  <label style={labelStyle} htmlFor="auth-name">
                    Имя
                  </label>
                  <input
                    id="auth-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ваше имя"
                    autoComplete="given-name"
                    style={inputStyle}
                    required
                  />
                </div>
              )}

              <div>
                <label style={labelStyle} htmlFor="auth-email">
                  Почта
                </label>
                <input
                  id="auth-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@example.com"
                  autoComplete="email"
                  style={inputStyle}
                  required
                />
              </div>

              <div>
                <label style={labelStyle} htmlFor="auth-password">
                  Пароль
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="auth-password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={tab === "register" ? "new-password" : "current-password"}
                    style={{ ...inputStyle, paddingRight: "6rem" }}
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
                      color: WHEEL_TEXT_COLOR,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    {showPassword ? "Скрыть" : "Показать"}
                  </button>
                </div>
              </div>

              {tab === "register" && (
                <div>
                  <label style={labelStyle} htmlFor="auth-confirm">
                    Повторите пароль
                  </label>
                  <input
                    id="auth-confirm"
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    autoComplete="new-password"
                    style={inputStyle}
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={busy}
                style={{
                  ...pillButton,
                  background: GOLD_SOFT,
                  opacity: busy ? 0.7 : 1,
                  cursor: busy ? "not-allowed" : "pointer",
                }}
              >
                {submitting
                  ? "Подождите…"
                  : tab === "register"
                    ? "Зарегистрироваться"
                    : "Войти"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
