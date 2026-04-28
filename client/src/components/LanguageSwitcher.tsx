import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage, LANGUAGE_FLAGS, type Language } from "@/lib/i18n";

const LANGUAGES: Language[] = ['sa', 'uk', 'en', 'ru'];

const LANGUAGE_NAMES: Record<Language, string> = {
  ru: 'Русский',
  en: 'English',
  uk: 'Українська',
  sa: 'संस्कृतम् (Saṃskṛtam)',
};

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 });

  // Calculate dropdown position when opening
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLanguageSelect = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  return (
    <>
      {/* Main language button */}
      <motion.button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 md:gap-2 px-2 md:px-3 py-1.5 md:py-2 bg-white shadow-md hover:shadow-lg transition-all border border-gray-200"
        style={{ borderRadius: "6px", height: "32px" }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span className="text-xs md:text-sm font-medium">{LANGUAGE_FLAGS[language]}</span>
        <span className="text-xs md:text-sm font-medium text-gray-700 hidden sm:inline">{LANGUAGE_NAMES[language]}</span>
        <motion.svg
          className="w-3 h-3 md:w-4 md:h-4 text-gray-500"
          animate={{ rotate: isOpen ? 180 : 0 }}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </motion.svg>
      </motion.button>

      {/* Dropdown menu - rendered in portal to avoid clipping */}
      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>
          {isOpen && (
            <motion.div
              ref={dropdownRef}
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              transition={{ duration: 0.15 }}
              className="fixed w-48 bg-white rounded-lg shadow-xl border border-gray-200"
              style={{
                top: dropdownPosition.top,
                right: dropdownPosition.right,
                zIndex: 999999,
              }}
            >
              {LANGUAGES.map((lang) => (
                <button
                  key={lang}
                  onClick={() => handleLanguageSelect(lang)}
                  className={`w-full px-4 py-3 flex items-center gap-3 transition-colors border-b border-gray-100 last:border-b-0 first:rounded-t-lg last:rounded-b-lg ${language === lang
                    ? 'bg-primary/10 text-primary'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <span className="text-sm font-medium">{LANGUAGE_FLAGS[lang]}</span>
                  <span className="font-medium">{LANGUAGE_NAMES[lang]}</span>
                  {language === lang && (
                    <motion.svg
                      className="w-5 h-5 ml-auto"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" />
                    </motion.svg>
                  )}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
