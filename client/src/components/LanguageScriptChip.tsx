import { useLanguageScript } from "@/lib/languageScript";

// Всегда показывает текущее значение (дефолт или уже выбранное) —
// в отличие от LanguageScriptMenuPanel, чипы не завязаны на флаги
// hasChosenLanguage/hasChosenScript и работают независимо от того,
// открывал ли пользователь футерное "Меню". Клик по любому чипу
// открывает тот же глобальный оверлей с колесом (см.
// LanguageScriptWheelOverlay), меняя только свой параметр — второй
// не трогается (см. selectLanguage/selectScript в контексте).
export function LanguageScriptChip() {
  const { languageLabel, scriptLabel, openLanguageWheel, openScriptWheel } =
    useLanguageScript();

  const chipStyle: React.CSSProperties = {
    color: "#FFD700",
    borderColor: "#FFD700",
  };

  return (
    <div className="flex gap-2 items-center">
      <button
        onClick={openLanguageWheel}
        className="px-3 py-1 rounded-full border-2 font-bold text-sm bg-white"
        style={chipStyle}
      >
        {languageLabel} ▾
      </button>
      <button
        onClick={openScriptWheel}
        className="px-3 py-1 rounded-full border-2 font-bold text-sm bg-white"
        style={chipStyle}
      >
        {scriptLabel} ▾
      </button>
    </div>
  );
}