import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface PasswordValidation {
  length: boolean;
  number: boolean;
  uppercase: boolean;
  lowercase: boolean;
}

export default function ResetPassword() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Get token from URL
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');

  const passwordValidation = useMemo<PasswordValidation>(() => ({
    length: password.length >= 8,
    number: /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  }), [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);
  const passwordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isPasswordValid) {
      toast({
        title: "Помилка",
        description: "Пароль не відповідає вимогам",
        variant: "destructive",
      });
      return;
    }

    if (!passwordsMatch) {
      toast({
        title: "Помилка",
        description: "Паролі не співпадають",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        toast({
          title: "Успішно!",
          description: "Пароль змінено. Тепер ви можете увійти.",
        });
      } else {
        toast({
          title: "Помилка",
          description: data.message || "Не вдалося змінити пароль",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Помилка",
        description: "Не вдалося підключитися до сервера",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const ValidationCheck = ({ valid, text }: { valid: boolean; text: string }) => (
    <div className="flex items-center gap-2">
      <div className={`w-4 h-4 rounded-full flex items-center justify-center ${valid ? 'bg-green-500' : 'bg-gray-300'}`}>
        {valid && (
          <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-sm ${valid ? 'text-green-600' : 'text-gray-500'}`}>{text}</span>
    </div>
  );

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <motion.div
          className="text-center bg-white rounded-3xl p-8 shadow-2xl mx-4 max-w-md"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Невірне посилання</h1>
          <p className="text-gray-600 mb-6">
            Посилання для скидання пароля недійсне або відсутнє.
          </p>
          <button
            onClick={() => setLocation('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
          >
            На головну
          </button>
        </motion.div>
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
        <motion.div
          className="text-center bg-white rounded-3xl p-8 shadow-2xl mx-4 max-w-md"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Пароль змінено!</h1>
          <p className="text-gray-600 mb-6">
            Ваш пароль успішно змінено. Тепер ви можете увійти з новим паролем.
          </p>
          <button
            onClick={() => setLocation('/')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg"
          >
            Увійти
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-100 via-pink-50 to-blue-100">
      <motion.div
        className="bg-white rounded-3xl p-8 shadow-2xl mx-4 max-w-md w-full"
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
      >
        <div className="text-center mb-6">
          <div className="text-5xl mb-2">🔐</div>
          <h1 className="text-2xl font-bold text-gray-800">Новий пароль</h1>
          <p className="text-gray-600 text-sm mt-2">Введіть новий пароль для вашого акаунту</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Новий пароль
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Password Requirements */}
            {password.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mt-2 p-3 bg-gray-50 rounded-lg space-y-1"
              >
                <p className="text-sm font-medium text-gray-700 mb-2">
                  Пароль повинен містити:
                </p>
                <ValidationCheck valid={passwordValidation.length} text="8 або більше символів" />
                <ValidationCheck valid={passwordValidation.number} text="Мінімум 1 цифру" />
                <ValidationCheck valid={passwordValidation.uppercase} text="Мінімум 1 велику літеру" />
                <ValidationCheck valid={passwordValidation.lowercase} text="Мінімум 1 малу літеру" />
              </motion.div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Підтвердіть пароль
            </label>
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all ${
                confirmPassword.length > 0
                  ? passwordsMatch
                    ? 'border-green-500'
                    : 'border-red-500'
                  : 'border-gray-300'
              }`}
              required
            />
            {confirmPassword.length > 0 && !passwordsMatch && (
              <p className="text-red-500 text-sm mt-1">Паролі не співпадають</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!isPasswordValid || !passwordsMatch || isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {isLoading ? "Зберігаємо..." : "Зберегти новий пароль"}
          </button>
        </form>

        <p className="text-center mt-4 text-gray-600 text-sm">
          <button
            onClick={() => setLocation('/')}
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Повернутися на головну
          </button>
        </p>
      </motion.div>
    </div>
  );
}
