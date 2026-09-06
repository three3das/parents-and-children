import { useLanguageScript } from "@/lib/languageScript";

const GOLD = "#FFD700";
const GOLD_LIGHT = "#FFE066";

// Шаг 0: язык ещё не выбирали — видна только кнопка "Языки".
// Шаг 2: язык выбран, письменность — ещё нет: кнопка "Языки" исчезает,
//        появляется подсказка + кнопка "Системы письменности".
// Шаг 4: оба выбраны — вместо кнопок-действий два ряда точечного
//        редактирования, каждый со своей меткой "изменить".
export function LanguageScriptMenuPanel() {
  const {
    hasChosenLanguage,
    hasChosenScript,
    languageLabel,
    scriptLabel,
    openLanguageWheel,
    openScriptWheel,
  } = useLanguageScript();

  if (!hasChosenLanguage) {
    return (
      <button
        onClick={openLanguageWheel}
        className="w-full px-4 py-3 text-left font-bold text-base transition hover:bg-yellow-50"
        style={{ color: GOLD }}
      >
        Языки
      </button>
    );
  }

  if (!hasChosenScript) {
    return (
      <div>
        <p className="px-4 pt-3 pb-1 text-sm" style={{ color: GOLD }}>
          Теперь выберите систему письменности для {languageLabel.toLowerCase()}
        </p>
        <button
          onClick={openScriptWheel}
          className="w-full px-4 py-3 text-left font-bold text-base transition hover:bg-yellow-50"
          style={{ color: GOLD }}
        >
          Системы письменности
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <button
        onClick={openLanguageWheel}
        className="w-full px-4 py-3 text-left font-bold text-base transition hover:bg-yellow-50 flex justify-between items-center"
        style={{ color: GOLD }}
      >
        <span>{languageLabel}</span>
        <span className="text-sm opacity-70">изменить</span>
      </button>
      <div className="h-px w-full" style={{ backgroundColor: GOLD_LIGHT }} />
      <button
        onClick={openScriptWheel}
        className="w-full px-4 py-3 text-left font-bold text-base transition hover:bg-yellow-50 flex justify-between items-center"
        style={{ color: GOLD }}
      >
        <span>{scriptLabel}</span>
        <span className="text-sm opacity-70">изменить</span>
      </button>
    </div>
  );
}