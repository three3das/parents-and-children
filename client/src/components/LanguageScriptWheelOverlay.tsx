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
export function LanguageScriptWheelOverlay() {
  const { activeWheel, language, script, closeWheel, selectLanguage, selectScript } =
    useLanguageScript();

  if (!activeWheel) return null;

  const isLanguage = activeWheel === "language";
  const options = isLanguage ? languageOptions : scriptOptions;
  const labels = options.map((o) => [o.label]);
  const activeIndex = isLanguage
    ? languageOptions.findIndex((l) => l.code === language)
    : scriptOptions.findIndex((s) => s.code === script);
  const centerLabel = isLanguage ? "Язык" : "Письменность";

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
          onSectorClick={(i) =>
            isLanguage ? selectLanguage(options[i].code) : selectScript(options[i].code)
          }
        />
      </div>
    </div>
  );
}