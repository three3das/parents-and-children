import { useEffect, useMemo, useState } from "react";
import { useLocation } from "wouter";
import { footerNav } from "@/lib/siteNav";
import { useHeaderNavItems } from "@/lib/headerWords";
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
//
// ⚠️ ПРАВКА (заставка перенесена наружу): SplashScreen больше НЕ
// рендерится здесь. Раньше маршрут "/" был обёрнут в
// RequireSubscription, который редиректил неавторизованных на /login
// ещё до рендера HomePage — заставка внутри HomePage для таких
// пользователей просто никогда не показывалась. Теперь заставкой
// управляет SplashGate.tsx на уровне маршрута "/", вне
// RequireSubscription; HomePage получает необязательный проп
// initialFooterKey — ключ кнопки, которую выбрали на заставке — и при
// монтировании выполняет тот же handleFooterClick, что и обычный клик
// по футеру, так что переходы гарантированно совпадают.

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

// ─── Колёса, открывающиеся по кнопкам хедера ───────────────────────────────
// Каждое — по аналогии с CATEGORY_WHEEL_LABELS: заполнены только первые
// N секторов, остальные (до 12) — пустые.

// "Самбандха" — 5 секторов
const SAMBANDHA_ITEMS: string[] = [
  "Ишвара",
  "Джива",
  "Пракрити",
  "Кала",
  "Карма",
];

const SAMBANDHA_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < SAMBANDHA_ITEMS.length ? splitLabelIntoLines(SAMBANDHA_ITEMS[i]) : [])
);

// "Абхидхея" — 9 секторов (девять видов бхакти)
const ABHIDHEYA_ITEMS: string[] = [
  "Шраванам",
  "Киртанам",
  "Смаранам",
  "Пада-севанам",
  "Арчанам",
  "Ванданам",
  "Дасьям",
  "Сакхьям",
  "Атма-ниведанам",
];

// Пада-севанам и Атма-ниведанам размещаются на трёх строках: часть до
// дефиса, отдельно сам дефис по центру, часть после дефиса.
function splitHyphenatedIntoThreeLines(label: string): string[] {
  const [prefix, suffix] = label.split("-");
  return [prefix, "-", suffix];
}

const ABHIDHEYA_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => {
    if (i >= ABHIDHEYA_ITEMS.length) return [];
    const item = ABHIDHEYA_ITEMS[i];
    return item.includes("-")
      ? splitHyphenatedIntoThreeLines(item)
      : splitLabelIntoLines(item);
  }
);

// "Прайоджана" — 5 секторов (пять рас)
const PRAYOJANA_ITEMS: string[] = [
  "Шанта",
  "Дасья",
  "Сакхья",
  "Ватсалья",
  "Мадхурья",
];

const PRAYOJANA_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < PRAYOJANA_ITEMS.length ? splitLabelIntoLines(PRAYOJANA_ITEMS[i]) : [])
);

// "Путеводитель" — колесо, открывающееся вместо мгновенного редиректа
// на /login для неавторизованного пользователя. Пока заполнен только
// сектор №1 ("Вход и благотворительный взнос"); остальные 11 — пустые
// заглушки, видимые, но некликабельные. Текст разбит вручную на 4
// строки с переносом слова "благотворительный" по дефису между
// строками 2 и 3 — иначе не помещается в круг.
const GUIDE_ITEMS: string[] = [
  "Вход и благотворительный взнос",
];

const GUIDE_CLICKABLE_INDICES = [0];

function splitGuideLabel(): string[] {
  return ["Вход", "и благотво-", "рительный", "взнос."];
}

const GUIDE_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i === 0 ? splitGuideLabel() : [])
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

type ViewState =
  | "main"
  | "games"
  | "dictionary"
  | "sambandha"
  | "abhidheya"
  | "prayojana"
  | "guide"
  | "guide-info";

interface HomePageProps {
  // Ключ кнопки, выбранной на заставке SplashGate (см. комментарий
  // выше файла) — "all-data" | "your-page" | "site-page" | "languages".
  // Необязательный: при обычном заходе (не через заставку) не
  // передаётся, и HomePage ведёт себя как раньше.
  initialFooterKey?: string;
}

export default function IshvaraPage({ initialFooterKey }: HomePageProps = {}) {
  // Язык и система письменности теперь берутся из общего контекста
  // (проксирует useLanguage() из "@/lib/i18n" — тот же язык, что видит
  // весь остальной сайт). Подписи кнопок хедера зависят от обоих
  // значений — см. useHeaderNavItems().
  const { language, script } = useLanguageScript();
  const headerItems = useHeaderNavItems(language, script);

  const [activeNav, setActiveNav] = useState<string>("sambandha");
  const [activeFooterNav, setActiveFooterNav] = useState<string>(
    footerNav[0].key
  );

  const [, setLocation] = useLocation();

  const { user, isAuthenticated } = useAuth();

  const games = useMemo(() => getGamesForLanguage(language), [language]);
  const gameWheelLabels = useMemo(() => getGameWheelLabels(games), [games]);

  // "main" — колесо тем (категорий), "games" — колесо с 7 играми,
  // "dictionary" — страница "Словарь используемых на сайте слов".
  // "sambandha"/"abhidheya"/"prayojana" — колёса из трёх кнопок
  // хедера. "guide" — колесо-путеводитель (открывается вместо
  // мгновенного /login для неавторизованного пользователя),
  // "guide-info" — экран пояснения про благотворительность внутри
  // сектора №1 путеводителя.
  const [view, setView] = useState<ViewState>("main");

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

  const handleGuideSectorClick = (index: number) => {
    if (index === 0) {
      setView("guide-info");
    }
  };

  // Клик по кнопкам хедера: каждая из трёх открывает своё колесо.
  const handleHeaderClick = (key: string) => {
    setActiveNav(key);
    if (key === "sambandha") {
      setView("sambandha");
    } else if (key === "abhidheya") {
      setView("abhidheya");
    } else if (key === "prayojana") {
      setView("prayojana");
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
        // Было: setLocation("/login") — мгновенный редирект.
        // Теперь: сначала показываем колесо-путеводитель, чтобы
        // пользователь мог осмотреться, не будучи сразу обязанным
        // войти/оплатить.
        setView("guide");
      } else {
        setLocation("/payments");
      }
    } else if (key === "your-page") {
      // Пока без действия.
    }
  };

  // ⚠️ ДОБАВЛЕНО: если HomePage смонтирована с initialFooterKey (то
  // есть пользователь только что выбрал одну из 4 кнопок на заставке
  // SplashGate) — выполняем ровно то же действие, что и обычный клик
  // по соответствующей кнопке футера. Срабатывает один раз при
  // монтировании.
  useEffect(() => {
    if (initialFooterKey) {
      handleFooterClick(initialFooterKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // "← Назад" на любом колесе, кроме колеса тем ("main"), обычно
  // возвращает на колесо тем (домашний экран). Единственное
  // исключение — экран "guide-info": оттуда возврат ведёт на
  // колесо-путеводитель ("guide"), а не сразу на главное колесо,
  // чтобы не терять контекст путеводителя.
  const handleBack = () => {
    if (view === "guide-info") {
      setView("guide");
    } else {
      setView("main");
    }
  };

  return (
    <WheelPageShell
      header={
        <WheelHeader items={headerItems} activeKey={activeNav} onSelect={handleHeaderClick} />
      }
      footer={
        <WheelFooter
          items={footerItems}
          activeKey={activeFooterNav}
          onSelect={handleFooterClick}
        />
      }
    >
      {view !== "main" && (
        <div className="flex-shrink-0 relative w-full flex justify-center items-center">
          <button
            onClick={handleBack}
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

        {view === "dictionary" && (
          <Wheel12 labels={DICTIONARY_LABELS} centerLabel="Словарь" />
        )}

        {view === "sambandha" && (
          <Wheel12 labels={SAMBANDHA_WHEEL_LABELS} centerLabel="Самбандха" />
        )}

        {view === "abhidheya" && (
          <Wheel12 labels={ABHIDHEYA_WHEEL_LABELS} centerLabel="Абхидхея" />
        )}

        {view === "prayojana" && (
          <Wheel12 labels={PRAYOJANA_WHEEL_LABELS} centerLabel="Прайоджана" />
        )}

        {view === "guide" && (
          <Wheel12
            labels={GUIDE_WHEEL_LABELS}
            centerLabel="Путеводитель"
            clickableIndices={GUIDE_CLICKABLE_INDICES}
            onSectorClick={handleGuideSectorClick}
          />
        )}

        {view === "guide-info" && (
          <div className="flex flex-col items-center justify-center gap-6 max-w-lg text-center px-4">
            <p className="text-lg" style={{ color: "#FFD700" }}>
              Этот сайт существует и развивается благодаря
              благотворительности — добровольным пожертвованиям тех,
              кому он приносит пользу.
            </p>
            <button
              onClick={() => setLocation("/payments")}
              className="px-6 py-3 rounded-full border-2 font-bold text-base transition bg-white"
              style={{ color: "#FFD700", borderColor: "#FFD700" }}
            >
              Перейти к оплате
            </button>
          </div>
        )}
      </div>
    </WheelPageShell>
  );
}