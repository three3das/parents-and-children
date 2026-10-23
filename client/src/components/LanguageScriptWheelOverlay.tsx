import { useEffect, useState } from "react";
import Wheel12 from "./Wheel12";
import {
  useLanguageScript,
  languageOptions,
  scriptOptions,
} from "@/lib/languageScript";

// Глобальный оверлей поверх любой страницы сайта. Открывается кликом
// на "Языки"/"Системы письменности" в футерном "Меню" (см.
// LanguageScriptMenuPanel) или кликом на чип на странице темы (см.
// LanguageScriptChip) — в обоих случаях через общий контекст
// useLanguageScript(), так что реализован он здесь один раз.
//
// "← Назад" здесь просто закрывает оверлей (closeWheel), возвращая на
// ту страницу, что была под ним — это НЕ навигация на колесо тем;
// правило "Назад всегда ведёт на колесо тем" касается только
// внутренних колёс IshvaraPage.tsx (категории/игры/подколёса) и не
// затронуто этим компонентом.

// ⚠️ ПРАВКА: подписи секторов раньше выводились одной строкой
// ([o.label]) и длинные названия ("Арабское письмо", "Индонезийский")
// выходили за круг сектора. Теперь:
//  • название из двух слов разбивается на два ряда (по слову в ряд);
//  • одно очень длинное слово (> MAX_WORD_CHARS) переносится по
//    слогам с дефисом (для известных слов — вручную, иначе пополам).
const MAX_WORD_CHARS = 11;

const HYPHENATED_WORDS: Record<string, string[]> = {
  Индонезийский: ["Индонезий-", "ский"],
  Португальский: ["Португаль-", "ский"],
};

function splitLabelForSector(label: string): string[] {
  const words = label.split(" ").filter(Boolean);

  if (words.length > 1) {
    // По слову в ряд (у нас названия из двух слов, максимум 4 ряда
    // поддерживает Wheel12).
    return words;
  }

  const word = words[0] ?? label;
  if (word.length <= MAX_WORD_CHARS) return [word];

  if (HYPHENATED_WORDS[word]) return HYPHENATED_WORDS[word];

  const mid = Math.ceil(word.length / 2);
  return [word.slice(0, mid) + "-", word.slice(mid)];
}

export function LanguageScriptWheelOverlay() {
  const {
    activeWheel,
    language,
    selectedScripts,
    closeWheel,
    selectLanguage,
    selectScripts,
  } = useLanguageScript();

  // Черновик выбора письменностей: применяется только по «Достаточно!».
  // «← Назад» закрывает колесо и выбор не меняет. Порядок кликов важен:
  // первая выбранная письменность становится основной.
  const [draft, setDraft] = useState<string[]>(selectedScripts);
  useEffect(() => {
    if (activeWheel === "script") setDraft(selectedScripts);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeWheel]);

  if (!activeWheel) return null;

  const isLanguage = activeWheel === "language";
  const options = isLanguage ? languageOptions : scriptOptions;
  const labels = options.map((o) => splitLabelForSector(o.label));
  const activeIndex = isLanguage
    ? languageOptions.findIndex((l) => l.code === language)
    : -1;
  const draftIndices = scriptOptions
    .map((s, i) => (draft.includes(s.code) ? i : -1))
    .filter((i) => i >= 0);
  const centerLabel = isLanguage ? "Язык" : "Письменность";

  const toggleDraft = (code: string) =>
    setDraft((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-4">
      <button
        onClick={closeWheel}
        className="absolute left-6 top-6 px-4 py-2 rounded-full border-2 font-bold text-base bg-white"
        style={{ color: "#FFD700", borderColor: "#FFD700" }}
      >
        ← Назад
      </button>

      <div className="w-full max-w-xl aspect-square">
        <Wheel12
          labels={labels}
          centerLabel={centerLabel}
          activeIndex={activeIndex >= 0 ? activeIndex : undefined}
          activeIndices={isLanguage ? undefined : draftIndices}
          onSectorClick={(i) =>
            isLanguage ? selectLanguage(options[i].code) : toggleDraft(options[i].code)
          }
        />
      </div>

      {!isLanguage && (
        <div className="mt-3 flex flex-col items-center gap-2 max-w-xl">
          <div className="text-sm font-bold" style={{ color: "#FFD700" }}>
            Выбрано: {draft.length} из {scriptOptions.length}
          </div>
          {draft.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1">
              {draft.map((code, i) => (
                <span
                  key={code}
                  className="px-2 py-0.5 rounded-full border text-xs font-bold bg-white"
                  style={{ color: "#FFD700", borderColor: "#FFD700" }}
                >
                  {i + 1}. {scriptOptions.find((s) => s.code === code)?.label}
                </span>
              ))}
            </div>
          )}
          <button
            onClick={() => selectScripts(draft)}
            disabled={draft.length === 0}
            className="px-6 py-2 rounded-full border-2 font-bold text-lg disabled:opacity-40"
            style={{ color: "#FFFFFF", backgroundColor: "#FFD700", borderColor: "#FFD700" }}
          >
            Достаточно!
          </button>
        </div>
      )}
    </div>
  );
}
