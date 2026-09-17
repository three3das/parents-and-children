import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useLanguage } from "@/lib/i18n";

// ⚠️ ПРАВКА: раньше languageOptions был плоским массивом из 12 языков.
// Теперь это ПОЛНЫЙ КАТАЛОГ всех языков, которые когда-либо были или
// будут в колесе — у каждого есть флаг active. languageOptions (см.
// ниже под каталогом) вычисляется автоматически — это только записи с
// active: true, в том порядке, в котором они здесь перечислены.
//
// Сейчас Бенгальский (bn) отключён (active: false), вместо него в
// колесе показывается Болгарский (bg) — это ВРЕМЕННАЯ замена. Чтобы
// вернуть Бенгальский обратно, когда понадобится:
//   1. У записи "bn" поставьте active: true.
//   2. У записи "bg" поставьте active: false (или удалите её совсем,
//      если болгарский эксперимент к тому моменту решат не продолжать).
// Никаких других правок в файле для этого не требуется — колесо,
// FIRST_LETTER/ALPHABET_LABEL ниже не нужно трогать, кроме, собственно,
// добавления bg в эти два словаря (уже сделано).
const LANGUAGE_CATALOG: { code: string; label: string; active: boolean }[] = [
  { code: "sa", label: "Санскрит", active: true },
  { code: "en", label: "Английский", active: true },
  { code: "ar", label: "Арабский", active: true },
  { code: "bn", label: "Бенгальский", active: false }, // временно выключен — см. пояснение выше
  { code: "bg", label: "Болгарский", active: true }, // временная замена бенгальского
  { code: "id", label: "Индонезийский", active: true },
  { code: "es", label: "Испанский", active: true },
  { code: "pt", label: "Португальский", active: true },
  { code: "ru", label: "Русский", active: true },
  { code: "uk", label: "Украинский", active: true },
  { code: "ur", label: "Урду", active: true },
  { code: "fr", label: "Французский", active: true },
  { code: "hi", label: "Хинди", active: true },
];

export const languageOptions = LANGUAGE_CATALOG.filter((l) => l.active);

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
  bg: "А",
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
  bg: "Азбука",
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
  const { language, setLanguage } = useLanguage();
  const [script, setScriptState] = useState<string>(DEFAULT_SCRIPT);
  const [hasChosenLanguage, setHasChosenLanguage] = useState(false);
  const [hasChosenScript, setHasChosenScript] = useState(false);
  const [activeWheel, setActiveWheel] = useState<WheelKind>(null);

  // Гарантируем дефолт языка (Санскрит) прямо здесь, а не полагаясь
  // на внешний компонент (раньше это делал useEffect в IshvaraPage.tsx —
  // теперь он удалён оттуда, и вся логика дефолта живёт в одном месте).
  // Срабатывает один раз при монтировании: если текущий language не
  // входит в список активных языков колеса — принудительно ставим
  // DEFAULT_LANGUAGE.
  useEffect(() => {
    const knownCodes = languageOptions.map((l) => l.code);
    if (!language || !knownCodes.includes(language)) {
      setLanguage(DEFAULT_LANGUAGE as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const openLanguageWheel = () => setActiveWheel("language");
  const openScriptWheel = () => setActiveWheel("script");
  const closeWheel = () => setActiveWheel(null);

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