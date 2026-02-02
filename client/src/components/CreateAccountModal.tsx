import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/lib/auth";

interface CreateAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

interface PasswordValidation {
  length: boolean;
  number: boolean;
  uppercase: boolean;
  lowercase: boolean;
}

export function CreateAccountModal({ isOpen, onClose, onSwitchToLogin }: CreateAccountModalProps) {
  const { t } = useLanguage();
  const { login } = useAuth();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newsletter, setNewsletter] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const passwordValidation = useMemo<PasswordValidation>(() => ({
    length: password.length >= 8,
    number: /\d/.test(password),
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
  }), [password]);

  const isPasswordValid = Object.values(passwordValidation).every(Boolean);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) return;

    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          firstName,
          lastName,
          password,
          newsletter
        }),
      });

      const data = await response.json();

      if (response.ok) {
        login(data.user);
        toast({
          title: "Успішно!",
          description: "Акаунт створено. Ви увійшли автоматично.",
        });
        onClose();
      } else {
        toast({
          title: "Помилка",
          description: data.message || "Не вдалося створити акаунт",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Registration error:", error);
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
    <div className="flex items-center gap-1.5">
      <div className={`w-3 h-3 rounded-full flex items-center justify-center ${valid ? 'bg-green-500' : 'bg-gray-300'}`}>
        {valid && (
          <svg className="w-2 h-2 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
          </svg>
        )}
      </div>
      <span className={`text-xs ${valid ? 'text-green-600' : 'text-gray-500'}`}>{text}</span>
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[99999] overflow-y-auto py-3"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-2xl p-5 max-w-sm w-full mx-4 shadow-2xl my-auto relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Title */}
            <h2 className="text-xl font-bold text-gray-800 mb-4 text-center">
              {t.auth.createAccount}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-2">
              {/* Email Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.auth.email}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  placeholder="email@example.com"
                  required
                />
              </div>

              {/* First Name Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.auth.firstName}
                </label>
                <input
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  required
                />
              </div>

              {/* Last Name Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.auth.lastName}
                </label>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-sm"
                  required
                />
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.auth.password}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all pr-10 text-sm"
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
                    className="mt-1 p-2 bg-gray-50 rounded-lg space-y-0.5"
                  >
                    <p className="text-xs font-medium text-gray-700 mb-1">
                      {t.auth.passwordRequirements.title}
                    </p>
                    <ValidationCheck valid={passwordValidation.length} text={t.auth.passwordRequirements.length} />
                    <ValidationCheck valid={passwordValidation.number} text={t.auth.passwordRequirements.number} />
                    <ValidationCheck valid={passwordValidation.uppercase} text={t.auth.passwordRequirements.uppercase} />
                    <ValidationCheck valid={passwordValidation.lowercase} text={t.auth.passwordRequirements.lowercase} />
                  </motion.div>
                )}
              </div>

              {/* Newsletter Checkbox */}
              <div className="flex items-start gap-2 mt-1">
                <input
                  type="checkbox"
                  id="newsletter"
                  checked={newsletter}
                  onChange={(e) => setNewsletter(e.target.checked)}
                  className="mt-0.5 w-3.5 h-3.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="newsletter" className="text-xs text-gray-600">
                  {t.auth.newsletter}
                </label>
              </div>

              {/* Terms Text */}
              <p className="text-[10px] text-gray-500 text-center mt-1">
                {t.auth.termsText}{" "}
                <a href="#" className="text-blue-600 hover:underline">{t.auth.termsLink}</a>{" "}
                &{" "}
                <a href="#" className="text-blue-600 hover:underline">{t.auth.privacyLink}</a>
              </p>

              {/* Create Account Button */}
              <button
                type="submit"
                disabled={!isPasswordValid || isLoading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-2 rounded-lg transition-colors text-sm"
              >
                {isLoading ? "Створення..." : t.auth.createAccount}
              </button>
            </form>

            {/* Switch to Login */}
            <p className="text-center mt-3 text-xs text-gray-600">
              {t.auth.alreadyHaveAccount}{" "}
              <button
                onClick={onSwitchToLogin}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t.auth.signInHere}
              </button>
            </p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
