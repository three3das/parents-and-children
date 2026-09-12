import { useMemo, useState } from "react";
import { useLocation } from "wouter";
import { headerNav, footerNav } from "@/lib/siteNav";
import { useAuth, getWelcomeName } from "@/lib/auth";
import {
  useLanguageScript,
  FIRST_LETTER,
  ALPHABET_LABEL,
} from "@/lib/languageScript";
import Wheel12, { SECTOR_COUNT } from "@/components/Wheel12";
import { WheelHeader, WheelFooter, WheelPageShell } from "@/components/SiteHeaderFooter";

// ⚠️ ПРАВКА: списки языков/письменностей (languageOptions/scriptOptions),
// FIRST_LETTER/ALPHABET_LABEL, DEFAULT_LANGUAGE и оба колеса выбора
// (LanguagesWheelView/ScriptsWheelView) переехали в
// "@/lib/languageScript" + "@/components/LanguageScriptWheelOverlay" —
// это общий контекст, доступный с любой страницы сайта (не только
// отсюда), в соответствии с финальной схемой мастера выбора
// языка/письменности. Здесь остаётся только то, что относится к
// колесу ТЕМ (категории/игры) — это прямая ответственность этой
// страницы.

const MAIN_WHEEL_LABELS: string[][] = [
  ["Сва-рупа", "Бхагавана"],
  ["Сва-рупа", "Параматмы"],
  ["Сва-рупа", "Брахмана"],
  ["Вечное бытие", "Сва-рупы", "Бхагавана"],
  ["Вечное бытие", "Сва-рупы", "Параматмы"],
  ["Вечное бытие", "Сва-рупы", "Брахмана"],
  ["Полное знание", "Сва-рупы", "Бхагавана"],
  ["Полное знание", "Сва-рупы", "Параматмы"],
  ["Полное знание", "Сва-рупы", "Брахмана"],
  ["Блаженство", "Сва-рупы", "Бхагавана"],
  ["Блаженство", "Сва-рупы", "Параматмы"],
  ["Блаженство", "Сва-рупы", "Брахмана"],
];

const SUB_WHEEL_CENTER_LABELS: string[] = MAIN_WHEEL_LABELS.map((lines) =>
  lines.join(" ")
);

const SUB_WHEEL_LABELS: string[][][] = Array.from(
  { length: SECTOR_COUNT },
  () => MAIN_WHEEL_LABELS
);

const DICTIONARY_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i === 0 ? ["Словарь", "используемых", "на сайте", "слов"] : [])
);

function splitLabelIntoLines(label: string): string[] {
  const words = label.split(" ");
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 2) {
    lines.push(words.slice(i, i + 2).join(" "));
  }
  return lines;
}

const CATEGORY_ITEMS: string[] = [
  "Игры",
  "Природа",
  "Кулинария",
  "Культура",
  "Образование",
  "Наука",
  "Творчество",
  "Медицина",
  "Обычаи",
  "Религия", 
  "Традиция",
  "Йога",
];

const CATEGORY_CLICKABLE_INDICES = [0];

const CATEGORY_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < CATEGORY_ITEMS.length ? splitLabelIntoLines(CATEGORY_ITEMS[i]) : [])
);

type GameType =
  | "alphabet-placeholder"
  | "picture-match"
  | "spell-word"
  | "syllables"
  | "sentence-game"
  | "audio-picture"
  | "audio-sentence";

function getGamesForLanguage(
  language: string
): { type: GameType; icon: string; label: string }[] {
  const alphabetIcon = FIRST_LETTER[language] ?? "A";
  const alphabetLabel = ALPHABET_LABEL[language] ?? "Alphabet";
  return [
    { type: "alphabet-placeholder", icon: alphabetIcon, label: alphabetLabel },
    { type: "picture-match", icon: "🖼️", label: "Картинки" },
    { type: "spell-word", icon: "✏️", label: "Слово" },
    { type: "syllables", icon: "🧱", label: "Слоги" },
    { type: "sentence-game", icon: "📝", label: "Предложение" },
    { type: "audio-picture", icon: "🔊", label: "Аудио-картинка" },
    { type: "audio-sentence", icon: "🎧", label: "Аудио-фраза" },
  ];
}

function getGameWheelLabels(games: { icon: string; label: string }[]): string[][] {
  return Array.from({ length: SECTOR_COUNT }, (_, i) =>
    i < games.length ? [games[i].icon, games[i].label] : []
  );
}

export default function IshvaraPage() {
  const [activeNav, setActiveNav] = useState<string>(headerNav[0].key);
  const [activeFooterNav, setActiveFooterNav] = useState<string>(
    footerNav[0].key
  );

  // Язык теперь берётся из общего контекста (проксирует useLanguage()
  // из "@/lib/i18n" — тот же язык, что видит весь остальной сайт).
  const { language } = useLanguageScript();
  const [, setLocation] = useLocation();

  const { user, isAuthenticated } = useAuth();

  const games = useMemo(() => getGamesForLanguage(language), [language]);
  const gameWheelLabels = useMemo(() => getGameWheelLabels(games), [games]);

  // "main" — колесо тем (категорий), "games" — колесо с 7 играми,
  // число (0–11) — вложенное колесо сектора, "dictionary" — страница
  // "Словарь используемых на сайте слов". Колёс "languages"/"scripts"
  // здесь больше нет — они переехали в глобальный оверлей.
  const [view, setView] = useState<"main" | "games" | number | "dictionary">(
    "main"
  );

  const handleSelectCategory = (index: number) => {
    if (index === 0) {
      setView("games");
    }
  };

  const handleGameSectorClick = (index: number) => {
    const game = games[index];
    if (game) {
      setLocation(`/game?game=${game.type}`);
    }
  };

  const handleFooterClick = (key: string) => {
    setActiveFooterNav(key);
    if (key === "languages") {
      // Открытие/закрытие выпадашки теперь целиком внутри WheelFooter
      // (см. SiteHeaderFooter.tsx) — здесь ничего дополнительно делать
      // не нужно, onSelect используется только для подсветки activeKey.
      return;
    } else if (key === "site-page") {
      setView("dictionary");
    } else if (key === "all-data") {
      if (!isAuthenticated) {
        setLocation("/login");
      } else {
        setLocation("/payments");
      }
    } else if (key === "your-page") {
      // Пока без действия.
    }
  };

  const footerItems = footerNav.map((item) =>
    item.key === "all-data"
      ? {
          ...item,
          label: isAuthenticated
            ? `Добро пожаловать, ${getWelcomeName(user)}!`
            : "Начальная страница сайта",
        }
      : item
  );

  return (
    <WheelPageShell
      header={
        <WheelHeader items={headerNav} activeKey={activeNav} onSelect={setActiveNav} />
      }
      footer={
        <WheelFooter
          items={footerItems}
          activeKey={activeFooterNav}
          onSelect={handleFooterClick}
        />
      }
    >
      {/* "← Назад" на любом колесе, кроме колеса тем ("main"), всегда
          возвращает на колесо тем (домашний экран) — правило не
          изменилось. */}
      {view !== "main" && (
        <div className="flex-shrink-0 relative w-full flex justify-center items-center">
          <button
            onClick={() => setView("main")}
            className="absolute left-6 px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
            style={{ color: "#FFD700", borderColor: "#FFD700" }}
          >
            ← Назад
          </button>
        </div>
      )}

      <div className="flex-1 min-h-0 w-full flex items-center justify-center overflow-hidden">
        {view === "main" && (
          <Wheel12
            labels={CATEGORY_WHEEL_LABELS}
            centerLabel="Игры"
            activeIndex={0}
            clickableIndices={CATEGORY_CLICKABLE_INDICES}
            onSectorClick={handleSelectCategory}
          />
        )}

        {view === "games" && (
          <Wheel12
            labels={gameWheelLabels}
            centerLabel="Игры"
            onSectorClick={handleGameSectorClick}
          />
        )}

        {typeof view === "number" && (
          <Wheel12
            labels={SUB_WHEEL_LABELS[view]}
            centerLabel={SUB_WHEEL_CENTER_LABELS[view]}
          />
        )}

        {view === "dictionary" && (
          <Wheel12 labels={DICTIONARY_LABELS} centerLabel="Словарь" />
        )}
      </div>
    </WheelPageShell>
  );
}