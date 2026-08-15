import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";

interface AuthDropdownProps {
  onLoginClick: () => void;
  onCreateAccountClick: () => void;
  onProgressClick?: () => void;
  onSettingsClick?: () => void;
  onSubscribeClick?: () => void;
}

export function AuthDropdown({ onLoginClick, onCreateAccountClick, onProgressClick, onSettingsClick, onSubscribeClick }: AuthDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useLanguage();
  const { user, isAuthenticated, logout } = useAuth();
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLoginClick = () => {
    setIsOpen(false);
    onLoginClick();
  };

  const handleCreateAccountClick = () => {
    setIsOpen(false);
    onCreateAccountClick();
  };

  const handleLogout = () => {
    setIsOpen(false);
    logout();
  };

  const handleProgressClick = () => {
    setIsOpen(false);
    onProgressClick?.();
  };

  const handleSettingsClick = () => {
    setIsOpen(false);
    onSettingsClick?.();
  };

  const handleSubscribeClick = () => {
    setIsOpen(false);
    onSubscribeClick?.();
  };

  // Get user initials for avatar
  const getInitials = () => {
    if (!user) return "";
    return `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <div className="relative z-[9999]" ref={dropdownRef}>
      {/* User Icon Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-center transition-colors"
        style={{
          borderRadius: "12px",
          height: "50px",
          width: "50px",
          border: "4px solid #FFD700",
          background: "#ffffff",
          color: "#FFD700",
          fontWeight: 700,
          fontSize: "1rem",
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isAuthenticated ? (
          <span style={{ color: "#FFD700", fontWeight: 700 }}>{getInitials()}</span>
        ) : (
          <svg
            className="w-6 h-6"
            style={{ color: "#FFD700" }}
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
          </svg>
        )}
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 overflow-hidden z-[9999]"
          >
            {isAuthenticated ? (
              <>
                {/* User info */}
                <div className="px-4 py-3 border-b border-gray-100">
                  <p className="text-[#FFD700] font-bold">{user?.firstName} {user?.lastName}</p>
                  <p className="text-sm text-[#FFD700] font-bold truncate">{user?.email}</p>
                </div>
                {/* Subscribe button */}
                <button
                  onClick={handleSubscribeClick}
                  className="w-full px-4 py-3 text-left text-white bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 transition-colors font-semibold border-b border-orange-300 flex items-center"
                >
                  <span className="mr-2">⭐</span>
                  Оформить подписку
                </button>
                {/* Progress button */}
                {onProgressClick && (
                  <button
                    onClick={handleProgressClick}
                    className="w-full px-4 py-3 text-left text-[#FFD700] font-bold hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center"
                  >
                    <span className="mr-2">📊</span>
                    {t.progress?.title || 'Прогресс'}
                  </button>
                )}
                {/* Settings button */}
                {onSettingsClick && (
                  <button
                    onClick={handleSettingsClick}
                    className="w-full px-4 py-3 text-left text-[#FFD700] font-bold hover:bg-gray-50 transition-colors border-b border-gray-100 flex items-center"
                  >
                    <span className="mr-2">⚙️</span>
                    {t.settings}
                  </button>
                )}
                {/* Logout button */}
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-3 text-left text-red-600 hover:bg-red-50 transition-colors font-medium"
                >
                  {t.auth.logout}
                </button>
              </>
            ) : (
              <>
                {/* Subscribe button for non-authenticated */}
                <button
                  onClick={handleSubscribeClick}
                  className="w-full px-4 py-3 text-left text-white bg-gradient-to-r from-yellow-400 to-orange-400 hover:from-yellow-500 hover:to-orange-500 transition-colors font-semibold border-b border-orange-300 flex items-center"
                >
                  <span className="mr-2">⭐</span>
                  Оформить подписку
                </button>
                <button
                  onClick={handleLoginClick}
                  className="w-full px-4 py-3 text-left text-[#FFD700] font-bold hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  {t.auth.login}
                </button>
                <button
                  onClick={handleCreateAccountClick}
                  className="w-full px-4 py-3 text-left text-[#FFD700] font-bold hover:bg-gray-50 transition-colors border-b border-gray-100"
                >
                  {t.auth.createAccount}
                </button>
                {/* Settings button */}
                {onSettingsClick && (
                  <button
                    onClick={handleSettingsClick}
                    className="w-full px-4 py-3 text-left text-[#FFD700] font-bold hover:bg-gray-50 transition-colors flex items-center"
                  >
                    <span className="mr-2">⚙️</span>
                    {t.settings}
                  </button>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}