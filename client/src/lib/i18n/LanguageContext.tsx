import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Language, Translations } from './types';
import { SUPPORTED_LANGUAGE_CODES } from './types';
import { translations, DEFAULT_LANGUAGE } from './translations';

const STORAGE_KEY = 'parents.and.children-language';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: Translations;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// ⚠️ Раньше здесь проверялись только 4 жёстко перечисленных кода
// ('en' | 'ru' | 'uk' | 'sa'), хотя приложение поддерживает 12 языков
// (см. languageOptions в IshvaraPage.tsx и SUPPORTED_LANGUAGE_CODES в
// types.ts). Любой другой сохранённый код (например 'hi' для Хинди)
// проваливал эту проверку и функция возвращала DEFAULT_LANGUAGE ('sa') —
// поэтому после перезагрузки/новой навигации выбор языка всегда
// откатывался на санскрит. Теперь сверяемся с полным списком.
function getStoredLanguage(): Language {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (
      stored &&
      (SUPPORTED_LANGUAGE_CODES as readonly string[]).includes(stored)
    ) {
      return stored as Language;
    }
  }
  return DEFAULT_LANGUAGE;
}

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(getStoredLanguage);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(STORAGE_KEY, lang);
  };

  // ⚠️ Объект translations пока заполнен переводами интерфейса только
  // для 4 языков (ru, en, uk, sa) — остальные 8 (ar, bn, id, es, pt,
  // ur, fr, hi) там не описаны. Без этой подстраховки `t` был бы
  // `undefined` для этих языков, и любое обращение вроде `t.settings`
  // роняло бы приложение с ошибкой. Пока переводы для них не добавлены,
  // используем английский текст интерфейса как запасной вариант — это
  // отдельная задача на будущее (полный перевод UI на оставшиеся 8
  // языков), не блокирующая работу игр вроде "Алфавит", которые берут
  // данные напрямую из Supabase, а не из этого словаря.
  const t = translations[language] ?? translations.en;

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}