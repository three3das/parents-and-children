import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

// --- Та же золотая палитра, что и в IshvaraPage.tsx / RegisterPage.tsx ---
const GOLD = { r: 255, g: 215, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

function mix(goldPct: number) {
  const r = Math.round(GOLD.r * goldPct + WHITE.r * (1 - goldPct));
  const g = Math.round(GOLD.g * goldPct + WHITE.g * (1 - goldPct));
  const b = Math.round(GOLD.b * goldPct + WHITE.b * (1 - goldPct));
  return `rgb(${r},${g},${b})`;
}

const COLOR_0 = mix(0); // чистый белый — фон карточки формы
const COLOR_33 = mix(0.33);
const COLOR_67 = mix(0.67);
const COLOR_100 = mix(1.0); // чистое золото #FFD700

export default function LoginPage() {
  const [, navigate] = useLocation();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        navigate('/');
      } else {
        setError(data.message || "Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Could not connect to server");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", width: "100%", display: "flex", flexDirection: "column" }}>
      <div
        style={{
          flex: 1,
          // Тот же градиент 33% → 67% → 100% золота, что и на
          // RegisterPage.tsx / у секторов колеса на главной странице.
          background: `linear-gradient(160deg, ${COLOR_33} 0%, ${COLOR_67} 60%, ${COLOR_100} 100%)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem 1rem",
        }}
      >
        <div
          style={{
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
            Sign In
          </h1>

          {error && (
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
              {error}
            </div>
          )}

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
                style={{
                  width: "100%",
                  padding: "0.75rem",
                  border: `1px solid ${COLOR_67}`,
                  borderRadius: "8px",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "border-color 0.2s",
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

            <button
              type="submit"
              disabled={isLoading}
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
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "1.5rem" }}>
            <p style={{ color: COLOR_67, fontSize: "0.875rem" }}>
              Don't have an account?{" "}
              <button
                onClick={() => navigate("/register")}
                style={{
                  background: "none",
                  border: "none",
                  color: COLOR_100,
                  fontWeight: "700",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Create Account
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}