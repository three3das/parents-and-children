import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { NavItem } from "@/lib/siteNav";

const HEADER_WORD_KEYS = ["sambandha", "abhidheya", "prayojana"] as const;
type HeaderWordKey = (typeof HEADER_WORD_KEYS)[number];

// Дефолтные подписи — Санскрит + Деванагари. Показываются сразу после
// загрузки страницы (пока идёт запрос к Supabase) и как фолбэк, если
// для текущего языка/системы письменности перевод в базе не найден.
const DEFAULT_LABELS: Record<HeaderWordKey, string> = {
  sambandha: "सम्बन्ध",
  abhidheya: "अभिधेय",
  prayojana: "प्रयोजन",
};

// Соответствие кода языка (из useLanguageScript) столбцу в таблице
// public.text_word_languages. Санскрит (sa) сюда намеренно не входит —
// для него подпись берётся из public.text_word_writing_systems по коду
// системы письменности (script), а не из этой таблицы.
const LANGUAGE_COLUMN: Record<string, string> = {
  en: "english",
  ar: "arabic",
  bn: "bengali",
  bg: "bulgarian",
  id: "indonesian",
  es: "spanish",
  pt: "portuguese",
  ru: "russian",
  uk: "ukrainian",
  ur: "urdu",
  fr: "french",
  hi: "hindi",
};

type WordRow = Record<string, string | null> & { id: string; word_key: string };
type ScriptRow = Record<string, string | null> & { word_id: string };

interface HeaderWordsState {
  words: WordRow[];
  scripts: ScriptRow[];
}

// Простой модульный кэш — запрос к Supabase выполняется один раз за
// время жизни вкладки, а не при каждом монтировании компонента.
let cachedState: HeaderWordsState | null = null;
let inFlight: Promise<HeaderWordsState> | null = null;

async function fetchHeaderWords(): Promise<HeaderWordsState> {
  if (cachedState) return cachedState;
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const { data: words, error: wordsError } = await supabase
      .from("text_word_languages")
      .select(
        "id, word_key, sanskrit, english, arabic, bengali, spanish, indonesian, portuguese, russian, ukrainian, urdu, french, hindi, bulgarian"
      )
      .in("word_key", HEADER_WORD_KEYS as unknown as string[]);

    if (wordsError || !words) {
      console.error("Не удалось загрузить слова хедера:", wordsError);
      const empty: HeaderWordsState = { words: [], scripts: [] };
      cachedState = empty;
      return empty;
    }

    const wordIds = words.map((w) => w.id);
    const { data: scripts, error: scriptsError } = await supabase
      .from("text_word_writing_systems")
      .select(
        "word_id, devanagari, arabic, bengali, gujarati, kannada, cyrillic, korean, latin, thai, tamil, telugu, ethiopic"
      )
      .in("word_id", wordIds);

    if (scriptsError) {
      console.error(
        "Не удалось загрузить системы письменности для слов хедера:",
        scriptsError
      );
    }

    const result: HeaderWordsState = {
      words: words as WordRow[],
      scripts: (scripts ?? []) as ScriptRow[],
    };
    cachedState = result;
    return result;
  })();

  return inFlight;
}

function resolveLabel(
  wordKey: HeaderWordKey,
  language: string,
  script: string,
  state: HeaderWordsState
): string {
  const word = state.words.find((w) => w.word_key === wordKey);
  if (!word) return DEFAULT_LABELS[wordKey];

  if (language === "sa") {
    const scriptRow = state.scripts.find((s) => s.word_id === word.id);
    return scriptRow?.[script] || DEFAULT_LABELS[wordKey];
  }

  const column = LANGUAGE_COLUMN[language];
  const value = column ? word[column] : null;
  return value || DEFAULT_LABELS[wordKey];
}

// Три пункта хедера ("Самбандха", "Абхидхея", "Прайоджана") с подписью
// на текущем языке/системе письменности. Реактивно пересчитывается при
// смене language/script через меню (LanguageScriptMenuPanel).
export function useHeaderNavItems(language: string, script: string): NavItem[] {
  const [state, setState] = useState<HeaderWordsState>(
    cachedState ?? { words: [], scripts: [] }
  );

  useEffect(() => {
    let cancelled = false;
    fetchHeaderWords().then((result) => {
      if (!cancelled) setState(result);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return HEADER_WORD_KEYS.map((key) => ({
    key,
    label: resolveLabel(key, language, script, state),
  }));
}