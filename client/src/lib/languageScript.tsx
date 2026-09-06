import { createContext, useContext, useState, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";

// Список языков — тот же порядок и коды, что были в IshvaraPage.tsx.
// Санскрит первым и является языком по умолчанию.
export const languageOptions = [
  { code: "sa", label: "Санскрит" },
  { code: "en", label: "Английский" },
  { code: "ar", label: "Арабский" },
  { code: "bn", label: "Бенгальский" },
  { code: "id", label: "Индонезийский" },
  { code: "es", label: "Испанский" },
  { code: "pt", label: "Португальский" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Украинский" },
  { code: "ur", label: "Урду" },
  { code: "fr", label: "Французский" },
  { code: "hi", label: "Хинди" },
];

// Список систем письменности — Деванагари первым (соответствует
// Санскриту по умолчанию), остальные 11 — по алфавиту.
//
// ⚠️ ПРАВКА: раньше здесь были китайские иероглифы, японское письмо,
// греческое, еврейское и грузинское письмо. Отобраны заново по двум
// критериям: (1) должна быть настоящая фонетическая письменность,
// подходящая под схему "буква → слог → слово → фраза → стих" — поэтому
// китайские иероглифы (логограммы) и японское письмо (смешанная
// кана/кандзи) убраны, а корейский хангыль оставлен (это полноценный
// фонетический алфавит, а не иероглифика); (2) из оставшихся систем —
// строго по числу носителей/пользователей в мире, поэтому греческое
// (~13 млн), еврейское (~9 млн) и грузинское (~4 млн) письмо заменены
// на более массовые: телугу (~83 млн), гуджарати (~60 млн), тайское
// (~60 млн), каннада (~44 млн) и эфиопское/геэз (~65 млн, амхарский +
// тигринья). Порядок столбцов совпадает с таблицей public.letter_text
// в Supabase.
export const scriptOptions = [
  { code: "devanagari", label: "Деванагари" },
  { code: "arabic", label: "Арабское письмо" },
  { code: "bengali", label: "Бенгальское письмо" },
  { code: "gujarati", label: "Гуджарати" },
  { code: "kannada", label: "Каннада" },
  { code: "cyrillic", label: "Кириллица" },
  { code: "korean", label: "Корейский хангыль" },
  { code: "latin", label: "Латиница" },
  { code: "thai", label: "Тайское письмо" },
  { code: "tamil", label: "Тамильское письмо" },
  { code: "telugu", label: "Телугу" },
  { code: "ethiopic", label: "Эфиопское письмо" },
];

export const DEFAULT_LANGUAGE = "sa";
export const DEFAULT_SCRIPT = "devanagari";

// Перенесено из IshvaraPage.tsx / GameMenu.tsx без изменений — первая
// буква алфавита и слово "алфавит" на каждом языке.
export const FIRST_LETTER: Record<string, string> = {
  sa: "अ",
  hi: "अ",
  en: "A",
  es: "A",
  pt: "A",
  fr: "A",
  id: "A",
  ru: "А",
  uk: "А",
  ar: "ا",
  ur: "ا",
  bn: "অ",
};

export const ALPHABET_LABEL: Record<string, string> = {
  sa: "वर्णमाला",
  hi: "वर्णमाला",
  en: "Alphabet",
  es: "Alfabeto",
  pt: "Alfabeto",
  fr: "Alphabet",
  id: "Alfabet",
  ru: "Алфавит",
  uk: "Алфавіт",
  ar: "الأبجدية",
  ur: "حروف تہجی",
  bn: "বর্ণমালা",
};

type WheelKind = "language" | "script" | null;

interface LanguageScriptContextValue {
  language: string;
  languageLabel: string;
  script: string;
  scriptLabel: string;
  // Флаги мастера: "пользователь уже проходил этот шаг явно" — не
  // путать со значениями language/script, которые всегда заданы
  // (за счёт дефолтов), даже если флаг ещё false.
  hasChosenLanguage: boolean;
  hasChosenScript: boolean;
  activeWheel: WheelKind;
  openLanguageWheel: () => void;
  openScriptWheel: () => void;
  closeWheel: () => void;
  selectLanguage: (code: string) => void;
  selectScript: (code: string) => void;
}

const LanguageScriptContext = createContext<LanguageScriptContextValue | null>(
  null
);

export function LanguageScriptProvider({ children }: { children: ReactNode }) {
  // Язык интерфейса общий для всего сайта — берём и меняем через
  // существующий useLanguage(), а не заводим отдельную копию.
  const { language, setLanguage } = useLanguage();
  const [script, setScriptState] = useState<string>(DEFAULT_SCRIPT);
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const [hasChosenScript, setHasChosenScript] = useState(false);
  const [activeWheel, setActiveWheel] = useState<WheelKind>(null);

  const openLanguageWheel = () => setActiveWheel("language");
  const openScriptWheel = () => setActiveWheel("script");
  const closeWheel = () => setActiveWheel(null);

  // Клик по сектору колеса языков — работает и для первого выбора
  // (Шаг 1), и для точечного редактирования языка (чип "изменить").
  // Если язык реально сменился — старая письменность больше не
  // гарантированно годится, поэтому сбрасываем флаг hasChosenScript и
  // сразу открываем колесо письменности следующим шагом. Если выбран
  // тот же язык — просто закрываем колесо, ничего больше не меняя.
  const selectLanguage = (code: string) => {
    const changed = code !== language;
    setLanguage(code as any);
    setHasChosenLanguage(true);
    if (changed) {
      setHasChosenScript(false);
      setActiveWheel("script");
    } else {
      setActiveWheel(null);
    }
  };

  const selectScript = (code: string) => {
    setScriptState(code);
    setHasChosenScript(true);
    setActiveWheel(null);
  };

  const languageLabel =
    languageOptions.find((l) => l.code === language)?.label ?? language;
  const scriptLabel =
    scriptOptions.find((s) => s.code === script)?.label ?? script;

  return (
    <LanguageScriptContext.Provider
      value={{
        language,
        languageLabel,
        script,
        scriptLabel,
        hasChosenLanguage,
        hasChosenScript,
        activeWheel,
        openLanguageWheel,
        openScriptWheel,
        closeWheel,
        selectLanguage,
        selectScript,
      }}
    >
      {children}
    </LanguageScriptContext.Provider>
  );
}

export function useLanguageScript() {
  const ctx = useContext(LanguageScriptContext);
  if (!ctx) {
    throw new Error(
      "useLanguageScript() must be used within <LanguageScriptProvider>"
    );
  }
  return ctx;
}