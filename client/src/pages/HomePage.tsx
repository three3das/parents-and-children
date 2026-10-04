import { useEffect, useMemo, useRef, useState } from "react";
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
// ⚠️ ДОБАВЛЕНО: тот же supabase-клиент, что и везде в проекте
// (если файл лежит по другому пути — поправьте только эту строку).
import { supabase } from "@/lib/supabase";

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
//
// ⚠️ ПРАВКА (колесо «Пракрити»): сектор «Пракрити» (№3) колеса
// «Самбандха» теперь кликабелен и открывает колесо из 12 предложений
// (view "prakriti"), загружаемых из таблицы text_sentence_languages по
// group_id = PRAKRITI_GROUP_ID (таблица text_sentence_languages). Клик по сектору открывает экран
// "prakriti-sentence" с полным текстом предложения.

// ⚠️ ПРАВКА (колесо «Свойства сайта»): кнопка «Свойства» в футере
// «Свойства сайта» (ключ "site-page" — та же кнопка на заставке и
// в футере) теперь открывает колесо из 12 секторов
// (view "properties"). В первом секторе — кнопка «Меню».
// Кнопка «Меню» (сектор №1) открывает колесо выбора (view
// "properties-menu") из двух секторов: «Язык» и «Системы письменности».
// Они вызывают openLanguageWheel() / openScriptWheel() из контекста
// useLanguageScript() — тот же глобальный оверлей
// LanguageScriptWheelOverlay, что и блок «Русский / Кириллица —
// изменить», поэтому логика выбора языка не дублируется.

// Фиксированные названия кнопок хедера (по ключу кнопки).
const HEADER_LABELS: Record<string, string> = {
  sambandha: "Родители",
  abhidheya: "Взаимоотношения",
  prayojana: "Дети",
};

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

// Индекс сектора «Пракрити» в SAMBANDHA_ITEMS (кликабелен).
const PRAKRITI_INDEX = SAMBANDHA_ITEMS.indexOf("Пракрити");
const SAMBANDHA_CLICKABLE_INDICES = [PRAKRITI_INDEX];

const SAMBANDHA_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < SAMBANDHA_ITEMS.length ? splitLabelIntoLines(SAMBANDHA_ITEMS[i]) : [])
);

// ─── «Пракрити»: 12 предложений из базы ────────────────────────────────────
// Группа создана в text_sentence_groups (Материальный мир, group_number = 1),
// 12 предложений привязаны к ней через group_id.
const PRAKRITI_GROUP_ID = "5cf5817f-f64c-41aa-b189-aaddb5bf3e19";

// Бейдж сектора в Wheel12 — круг диаметром ≈ 88 единиц, а шрифт
// подписи жирный 12.6 (≈ 10 кириллических символов в строку, не больше
// 4 строк — Wheel12 умеет центрировать только 1–4 строки). Поэтому
// предложения переносим по символам, а не «по 2 слова», как короткие
// названия разделов; если не помещается — обрезаем «…» (полный текст
// виден после клика).
function splitSentenceIntoLines(
  text: string,
  maxChars = 10,
  maxLines = 4
): string[] {
  const words = text.trim().split(/\s+/);
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (candidate.length <= maxChars || !current) {
      current = candidate;
    } else {
      lines.push(current);
      current = word;
    }
  }
  if (current) lines.push(current);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    kept[maxLines - 1] = kept[maxLines - 1].slice(0, maxChars - 1) + "…";
    return kept;
  }
  return lines;
}

// Предложения лежат в text_sentence_languages (а не в
// sentences_and_phrases — там нет group_id).
interface PrakritiSentence {
  id: string;
  sentence_number: number | null;
  sentence_text: string;
}

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

// "Свойства сайта" — колесо, которое открывает кнопка «Свойства» в
// футере. Пока заполнен только сектор №1 («Меню»), остальные 11 —
// пустые заглушки, видимые, но некликабельные.
// Ключ кнопки «Свойства сайта»: на заставке (SplashScreen) это третья
// кнопка, в футере — тоже третья. Оба места используют один ключ
// "site-page", поэтому колесо открывается из обоих. «Домашняя
// страница» ("your-page") остаётся без действия, как раньше.
const PROPERTIES_FOOTER_KEY = "site-page";

const PROPERTIES_ITEMS: string[] = ["Меню"];

const PROPERTIES_CLICKABLE_INDICES = [0];

const PROPERTIES_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < PROPERTIES_ITEMS.length ? splitLabelIntoLines(PROPERTIES_ITEMS[i]) : [])
);

// Колесо «Меню»: два сектора — выбор языка и выбор системы письменности
// (оба открывают глобальный оверлей; текущий выбор в нём подсвечен).
const PROPERTIES_MENU_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) =>
    i === 0 ? ["Язык"] : i === 1 ? ["Системы", "письмен-", "ности"] : []
);

const PROPERTIES_MENU_CLICKABLE_INDICES = [0, 1];

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
  | "prakriti"
  | "prakriti-sentence"
  | "abhidheya"
  | "prayojana"
  | "guide"
  | "guide-info"
  | "properties"
  | "properties-menu";

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
  const { language, script, openLanguageWheel, openScriptWheel } = useLanguageScript();
  // ⚠️ ПРАВКА: подписи трёх кнопок хедера теперь фиксированные
  // (раньше useHeaderNavItems подставлял слова на выбранном
  // языке/письменности — например, санскрит на деванагари). Ключи
  // кнопок не меняются, поэтому их действие (см. handleHeaderClick)
  // осталось прежним: слева — "sambandha", по центру — "abhidheya",
  // справа — "prayojana".
  const rawHeaderItems = useHeaderNavItems(language, script);
  const headerItems = rawHeaderItems.map((item) => ({
    ...item,
    label: HEADER_LABELS[item.key] ?? item.label,
  }));

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
  // хедера. "prakriti" — колесо из 12 предложений (подраздел
  // «Пракрити» раздела «Самбандха»), "prakriti-sentence" — экран с
  // выбранным предложением. "guide" — колесо-путеводитель
  // (открывается вместо мгновенного /login для неавторизованного
  // пользователя), "guide-info" — экран пояснения про
  // благотворительность внутри сектора №1 путеводителя.
  const [view, setView] = useState<ViewState>("main");

  // ─── Состояние колеса «Пракрити» ─────────────────────────────────────────
  const [prakritiSentences, setPrakritiSentences] = useState<PrakritiSentence[]>([]);
  const [prakritiLoading, setPrakritiLoading] = useState(false);
  const [prakritiError, setPrakritiError] = useState<string | null>(null);
  // Флаг «запрос уже отправлен» — ref, а не state: его изменение не
  // перезапускает эффект и не отменяет ответ (см. эффект ниже).
  const prakritiRequestedRef = useRef(false);
  const [selectedSentenceIndex, setSelectedSentenceIndex] = useState<number | null>(null);

  // Загружаем предложения один раз — при первом открытии колеса.
  // ⚠️ Зависимость только [view]: если включить сюда prakritiLoading,
  // то setPrakritiLoading(true) перезапускает эффект, cleanup помечает
  // запрос как отменённый, и «Загрузка…» висит вечно.
  useEffect(() => {
    if (view !== "prakriti" || prakritiRequestedRef.current) return;
    prakritiRequestedRef.current = true;

    const load = async () => {
      setPrakritiLoading(true);
      setPrakritiError(null);
      try {
        const { data, error } = await supabase
          .from("text_sentence_languages")
          .select("id, sentence_number, sentence_text")
          .eq("group_id", PRAKRITI_GROUP_ID)
          .order("sort_order", { ascending: true })
          .order("sentence_number", { ascending: true })
          .limit(SECTOR_COUNT);
        if (error) {
          setPrakritiError(error.message);
          prakritiRequestedRef.current = false; // разрешаем повторную попытку
        } else {
          setPrakritiSentences((data ?? []) as PrakritiSentence[]);
        }
      } catch (e) {
        setPrakritiError(e instanceof Error ? e.message : String(e));
        prakritiRequestedRef.current = false;
      } finally {
        setPrakritiLoading(false);
      }
    };
    load();
  }, [view]);

  // Подписи секторов: само предложение, перенесённое так, чтобы
  // помещаться в круглый бейдж Wheel12 (см. splitSentenceIntoLines).
  // Полный текст — на экране "prakriti-sentence".
  const prakritiWheelLabels: string[][] = useMemo(
    () =>
      Array.from({ length: SECTOR_COUNT }, (_, i) =>
        i < prakritiSentences.length
          ? splitSentenceIntoLines(prakritiSentences[i].sentence_text)
          : []
      ),
    [prakritiSentences]
  );

  const prakritiClickableIndices = useMemo(
    () => prakritiSentences.map((_, i) => i),
    [prakritiSentences]
  );

  const handleSambandhaSectorClick = (index: number) => {
    if (index === PRAKRITI_INDEX) {
      setView("prakriti");
    }
  };

  const handlePrakritiSectorClick = (index: number) => {
    if (prakritiSentences[index]) {
      setSelectedSentenceIndex(index);
      setView("prakriti-sentence");
    }
  };

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

  // Кнопка «Меню» (сектор №1 колеса «Свойства сайта») → колесо с
  // выбором языка / системы письменности.
  const handleMenuClick = () => {
    setView("properties-menu");
  };

  const handlePropertiesSectorClick = (index: number) => {
    if (index === 0) {
      handleMenuClick();
    }
  };

  // Колесо «Меню»: сектор 0 — язык, сектор 1 — система письменности.
  const handlePropertiesMenuSectorClick = (index: number) => {
    if (index === 0) {
      openLanguageWheel();
    } else if (index === 1) {
      openScriptWheel();
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

  // Является ли ключ кнопкой «Свойства сайта». На заставке это
  // "site-page", а у третьей кнопки футера ключ может быть другим
  // (его задаёт footerNav в "@/lib/siteNav") — поэтому дополнительно
  // считаем «Свойствами сайта» третий элемент footerNav (порядок на
  // экране: Предмет изучения / Домашняя страница / Свойства сайта).
  const isPropertiesKey = (key: string) => {
    if (key === PROPERTIES_FOOTER_KEY) return true;
    const thirdKey = footerNav[2]?.key;
    return (
      thirdKey !== undefined &&
      key === thirdKey &&
      !["languages", "all-data", "your-page"].includes(key)
    );
  };

  // Является ли ключ кнопкой «Домашняя страница». В footerNav.ts это
  // "home", а заставка (SplashScreen.tsx) до сих пор шлёт свой старый
  // захардкоженный ключ "your-page" — принимаем оба, чтобы кнопка
  // работала одинаково из обоих мест.
  const isHomeKey = (key: string) => key === "home" || key === "your-page";

  const handleFooterClick = (key: string) => {
    // Отладка: какой ключ пришёл от кнопки футера (можно убрать).
    console.debug("[footer] key =", key, "| footerNav:", footerNav.map((i) => i.key));
    setActiveFooterNav(key);
    if (key === "languages") {
      // Открытие/закрытие выпадашки теперь целиком внутри WheelFooter
      // (см. SiteHeaderFooter.tsx) — здесь ничего дополнительно делать
      // не нужно, onSelect используется только для подсветки activeKey.
      return;
    } else if (isPropertiesKey(key)) {
      // «Свойства сайта» (заставка и футер) → колесо с кнопкой «Меню».
      // (Раньше здесь открывалось колесо "dictionary" — код этого
      // колеса оставлен ниже, но сейчас оно ни из чего не открывается.)
      setView("properties");
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
    } else if (isHomeKey(key)) {
      // «Домашняя страница» → главное колесо тем (то же, что открывается
      // по умолчанию и с приветственной страницы). Принимаем оба ключа:
      // "home" (footerNav.ts) и "your-page" (захардкожен в SplashScreen.tsx).
      setView("main");
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
  // возвращает на колесо тем (домашний экран). Исключения:
  //  • "guide-info" → "guide" (не теряем контекст путеводителя);
  //  • "properties-menu" → "properties" (обратно в «Свойства сайта»);
  //  • "prakriti" → "sambandha" (обратно в колесо «Самбандха»);
  //  • "prakriti-sentence" → "prakriti" (обратно в колесо предложений).
  const handleBack = () => {
    if (view === "guide-info") {
      setView("guide");
    } else if (view === "properties-menu") {
      setView("properties");
    } else if (view === "prakriti") {
      setView("sambandha");
    } else if (view === "prakriti-sentence") {
      setView("prakriti");
    } else {
      setView("main");
    }
  };

  const selectedSentence =
    selectedSentenceIndex !== null ? prakritiSentences[selectedSentenceIndex] : null;

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
          <Wheel12 labels={DICTIONARY_LABELS} centerLabel="Все страницы сайта" />
        )}

        {view === "sambandha" && (
          <Wheel12
            labels={SAMBANDHA_WHEEL_LABELS}
            centerLabel="Самбандха"
            clickableIndices={SAMBANDHA_CLICKABLE_INDICES}
            onSectorClick={handleSambandhaSectorClick}
          />
        )}

        {view === "prakriti" && (
          <>
            {prakritiLoading && (
              <p className="text-lg" style={{ color: "#FFD700" }}>
                Загрузка…
              </p>
            )}
            {prakritiError && (
              <p className="text-lg text-center px-4" style={{ color: "#FFD700" }} role="alert">
                Не удалось загрузить предложения: {prakritiError}
              </p>
            )}
            {!prakritiLoading && !prakritiError && (
              <Wheel12
                labels={prakritiWheelLabels}
                centerLabel="Пракрити"
                clickableIndices={prakritiClickableIndices}
                onSectorClick={handlePrakritiSectorClick}
              />
            )}
          </>
        )}

        {view === "prakriti-sentence" && selectedSentence && (
          <div className="flex flex-col items-center justify-center gap-4 max-w-lg text-center px-4">
            <p className="text-2xl font-bold" style={{ color: "#FFD700" }}>
              {selectedSentence.sentence_text}
            </p>
          </div>
        )}

        {view === "properties" && (
          <Wheel12
            labels={PROPERTIES_WHEEL_LABELS}
            centerLabel="Свойства сайта"
            clickableIndices={PROPERTIES_CLICKABLE_INDICES}
            onSectorClick={handlePropertiesSectorClick}
          />
        )}

        {view === "properties-menu" && (
          <Wheel12
            labels={PROPERTIES_MENU_LABELS}
            centerLabel="Меню"
            clickableIndices={PROPERTIES_MENU_CLICKABLE_INDICES}
            onSectorClick={handlePropertiesMenuSectorClick}
          />
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
            centerLabel="Начальная страница сайта"
            clickableIndices={GUIDE_CLICKABLE_INDICES}
            onSectorClick={handleGuideSectorClick}
          />
        )}

        {view === "guide-info" && (
          <div className="flex flex-col items-center justify-center gap-6 max-w-lg text-center px-4">
            <p className="text-lg" style={{ color: "#FFD700" }}>
              Примите благодарность за поддержку служения сайта
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