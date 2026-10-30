import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useSearch } from "wouter";
import { footerNav } from "@/lib/siteNav";
import { useHeaderNavItems } from "@/lib/headerWords";
import { useAuth, getWelcomeName } from "@/lib/auth";
import {
  useLanguageScript,
  FIRST_LETTER,
  ALPHABET_LABEL,
} from "@/lib/languageScript";
import { WHEEL_TEXT_COLOR } from "@/lib/colors";
import { getSavedResult } from "@/lib/gameResults";
import Wheel12, { SECTOR_COUNT } from "@/components/Wheel12";
import { WheelHeader, WheelFooter, WheelPageShell } from "@/components/SiteHeaderFooter";
// ⚠️ ДОБАВЛЕНО: общая форма «поиск по странице / сортировка по
// запросу» (client/src/components/SortRequestForm.tsx). Из неё же
// берём CATEGORY_ITEMS — список из 12 разделов хранится в одном месте
// и для колеса тем, и для поля «Разделы» в форме.
import SortRequestForm, {
  CATEGORY_ITEMS,
  type SortValues,
} from "@/components/SortRequestForm";
// ⚠️ ДОБАВЛЕНО: экран «Загадки» (client/src/components/RiddlesView.tsx).
import RiddlesView from "@/components/RiddlesView";
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
//
// ⚠️ ПРАВКА (сектор «Джива»): сектор «Джива» (№2) колеса «Самбандха»
// теперь кликабелен и открывает тот же экран с формой SortRequestForm
// (view "path-ready"), что и «Свойства сайта» → «Начало пути по сайту»
// → «Уже готово для вас». Чтобы кнопка «← Назад» возвращала именно
// туда, откуда экран открыт, запоминается источник (pathReadyOrigin):
// "path" (из «Начала пути по сайту») или "sambandha" (из «Дживы»).
//
// ⚠️ ПРАВКА (кнопка «Шастра»): на «Домашней странице» (главное колесо,
// view "main") во втором секторе (индекс 1) стоит кнопка «Шастра».
// Она открывает форму (view "shastra") с полями song / chapter /
// text (по умолчанию 0, 1, 1) и выбором шастры. Кнопка «Показать
// стих» читает стих из двух таблиц Supabase — text_shastra_languages
// (12 столбцов языков) и text_shastra_writting_systems (12 столбцов
// письменностей) — и открывает отдельный экран (view "shastra-verse"),
// где в одном поле показывается стих в выбранном сочетании
// «письменность + язык». Ключ строки в обеих таблицах:
// (shastra, song, chapter, text), где text — номер стиха.
//
// ⚠️ ПРАВКА (кнопка «Загадки»): на «Домашней странице» (главное колесо,
// view "main") в третьем секторе (индекс 2) стоит кнопка «Загадки».
// Она открывает экран с детскими загадками (view "riddles",
// компонент RiddlesView).

// «Свойства сайта» (ключ "site-page" — та же кнопка на заставке и
// в футере) теперь открывает колесо из 12 секторов
// (view "properties"). В первом секторе — кнопка «Начало пути по
// сайту» (открывает колесо обозрения из 12 секторов, view "path": в
// его первом секторе — кнопка «Уже готово для вас», она открывает
// экран с формой SortRequestForm, view "path-ready"), во втором —
// кнопка «Меню», в третьем — «Узнать возможности сайта» (view
// (Регистрация и вход вынесены на отдельную страницу /auth, она
// открывается кнопкой «Регистрация и авторизация» на заставке.)
// Кнопка «Меню» (сектор №2) открывает колесо выбора (view
// "properties-menu") из двух секторов: «Язык» и «Системы письменности».
// Они вызывают openLanguageWheel() / openScriptWheel() из контекста
// useLanguageScript() — тот же глобальный оверлей
// LanguageScriptWheelOverlay, что и блок «Русский / Кириллица —
// изменить», поэтому логика выбора языка не дублируется.
// Кнопка «Хочу поддержать проект» (сектор №12) открывает экран
// "guide-info" (благодарность + «Перейти к оплате»), а кнопка «Назад»
// возвращает обратно в «Свойства сайта».

// Фиксированные названия кнопок хедера (по ключу кнопки).
const HEADER_LABELS: Record<string, string> = {
  sambandha: "Самбандха",
  abhidheya: "Абхидхея",
  prayojana: "Прайоджана",
};

function splitLabelIntoLines(label: string): string[] {
  const words = label.split(" ");
  const lines: string[] = [];
  for (let i = 0; i < words.length; i += 2) {
    lines.push(words.slice(i, i + 2).join(" "));
  }
  return lines;
}

// ⚠️ ПРАВКА: список из 12 разделов (CATEGORY_ITEMS) больше не
// объявляется здесь — он импортируется из SortRequestForm (см. импорт
// выше), чтобы колесо тем и поле «Разделы» формы всегда совпадали.

// ⚠️ ПРАВКА: сектор №2 (индекс 1) главного колеса — кнопка «Шастра».
const SHASTRA_INDEX = 1;
const SHASTRA_LABEL = "Шастра";

// ⚠️ ДОБАВЛЕНО: сектор №3 (индекс 2) главного колеса — кнопка «Загадки».
const RIDDLES_INDEX = 2;
const RIDDLES_LABEL = "Загадки";

// Сектор №1 («Игры»), №2 («Шастра») и №3 («Загадки») кликабельны.
const CATEGORY_CLICKABLE_INDICES = [0, SHASTRA_INDEX, RIDDLES_INDEX];

const CATEGORY_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => {
    // ⚠️ ПРАВКА: во втором секторе вместо названия раздела — «Шастра».
    // Список CATEGORY_ITEMS (и поле «Разделы» формы) при этом не
    // меняется — подмена только на этом колесе.
    if (i === SHASTRA_INDEX) return [SHASTRA_LABEL];
    // ⚠️ ДОБАВЛЕНО: в третьем секторе — «Загадки».
    if (i === RIDDLES_INDEX) return [RIDDLES_LABEL];
    return i < CATEGORY_ITEMS.length ? splitLabelIntoLines(CATEGORY_ITEMS[i]) : [];
  }
);

// ─── «Шастра»: стихи из таблиц Supabase ────────────────────────────────────
// Таблица text_shastra_writting_systems: по одному столбцу на каждую
// из 12 письменностей. Таблица text_shastra_languages: по одному
// столбцу на каждый из 12 языков (индонезийский — столбец id_lang,
// потому что id занят под ключ строки).
const SHASTRA_OPTIONS: { key: string; label: string }[] = [
  { key: "bhagavad_gita", label: "Бхагавад-гита" },
  { key: "srimad_bhagavatam", label: "Шримад-Бхагаватам" },
];

const SHASTRA_SCRIPTS: { column: string; label: string }[] = [
  { column: "devanagari", label: "Деванагари" },
  { column: "arabic", label: "Арабское письмо" },
  { column: "bengali", label: "Бенгальское письмо" },
  { column: "gujarati", label: "Гуджарати" },
  { column: "kannada", label: "Каннада" },
  { column: "cyrillic", label: "Кириллица" },
  { column: "hangul", label: "Корейский хангыль" },
  { column: "latin", label: "Латиница" },
  { column: "thai", label: "Тайское письмо" },
  { column: "tamil", label: "Тамильское письмо" },
  { column: "telugu", label: "Телугу" },
  { column: "ethiopic", label: "Эфиопское письмо" },
];

const SHASTRA_LANGUAGES: { column: string; label: string }[] = [
  { column: "sa", label: "Санскрит" },
  { column: "hi", label: "Хинди" },
  { column: "en", label: "Английский" },
  { column: "ar", label: "Арабский" },
  { column: "bn", label: "Бенгальский" },
  { column: "id_lang", label: "Индонезийский" },
  { column: "es", label: "Испанский" },
  { column: "pt", label: "Португальский" },
  { column: "ru", label: "Русский" },
  { column: "uk", label: "Украинский" },
  { column: "ur", label: "Урду" },
  { column: "fr", label: "Французский" },
];

// Строка таблицы: служебные поля + столбцы с текстом.
type ShastraRow = Record<string, string | number | null>;

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

// Индексы кликабельных секторов в SAMBANDHA_ITEMS.
// ⚠️ ПРАВКА: добавлен сектор «Джива» (открывает экран с формой).
const JIVA_INDEX = SAMBANDHA_ITEMS.indexOf("Джива");
const PRAKRITI_INDEX = SAMBANDHA_ITEMS.indexOf("Пракрити");
const SAMBANDHA_CLICKABLE_INDICES = [JIVA_INDEX, PRAKRITI_INDEX];

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

// "Свойства сайта" — колесо, которое открывает кнопка «Свойства» в
// футере. Заполнены сектора: №1 («Начало пути по сайту»), №2
// («Меню»), №3 («Узнать возможности сайта»), №11 («Регистрация и
// авторизация») и №12 («Хочу поддержать проект»); остальные — пустые
// заглушки, видимые, но некликабельные.
// Ключ кнопки «Свойства сайта»: на заставке (SplashScreen) это третья
// кнопка, в футере — тоже третья. Оба места используют один ключ
// "site-page", поэтому колесо открывается из обоих. «Домашняя
// страница» ("your-page") остаётся без действия, как раньше.
const PROPERTIES_FOOTER_KEY = "site-page";

// Индексы секторов (нумерация с 0): сектор №1 → 0, №2 → 1, №3 → 2,
// №11 → 10, №12 → 11.
// ⚠️ ПРАВКА: «Начало пути по сайту» — сектор №1 (индекс 0), «Меню»
// перенесено со 1-го сектора на 2-й (индекс 1).
const PROPERTIES_PATH_INDEX = 0;
const PROPERTIES_MENU_INDEX = 1;
const PROPERTIES_FEATURES_INDEX = 2;
const PROPERTIES_SUPPORT_INDEX = SECTOR_COUNT - 1;
const PROPERTIES_FEATURES_LABEL = ["Узнать", "возможно-", "сти сайта"];

// Ручная разбивка подписей (в круг Wheel12 влезает ≈10 символов в строку).
const PROPERTIES_PATH_LABEL = ["Начало", "пути по", "сайту"];

const PROPERTIES_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => {
    if (i === PROPERTIES_PATH_INDEX) return PROPERTIES_PATH_LABEL;
    if (i === PROPERTIES_MENU_INDEX) return ["Меню"];
    if (i === PROPERTIES_FEATURES_INDEX) return PROPERTIES_FEATURES_LABEL;
    // Ручная разбивка на 3 строки — иначе "Оплатить и подключиться"
    // не помещается в круг (влезает ≈10 символов в строку).
    if (i === PROPERTIES_SUPPORT_INDEX) return ["Оплатить", "и подклю-", "читься"];

    return [];
  }
);

// Колесо «Меню»: два сектора — выбор языка и выбор системы письменности
// (оба открывают глобальный оверлей; текущий выбор в нём подсвечен).
const PROPERTIES_MENU_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) =>
    i === 0 ? ["Язык"] : i === 1 ? ["Системы", "письмен-", "ности"] : []
);
const PROPERTIES_MENU_CLICKABLE_INDICES = [0, 1];

// ⚠️ ДОБАВЛЕНО: колесо «Начало пути по сайту» (view "path") — 12
// секторов в том же стиле, что и остальные колёса сайта. Это колесо
// обозрения: пока заполнен только сектор №1 («Уже готово для вас»),
// остальные 11 — пустые заглушки, видимые, но некликабельные. Сектор
// №1 открывает экран с формой (view "path-ready").
const PATH_READY_INDEX = 0;

const PATH_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i === PATH_READY_INDEX ? ["Уже", "готово", "для вас"] : [])
);

const PATH_WHEEL_CLICKABLE_INDICES = [PATH_READY_INDEX];

// ⚠️ ПРАВКА: экран «Уже готово для вас» (view "path-ready") строится
// на общем компоненте SortRequestForm (поля «Возраст», «Тема»,
// «Разделы» и кнопка «Сортировка по запросу» описаны там). Списки
// вариантов и сам выпадающий список больше не дублируются в этом
// файле — тот же компонент можно подключать на других страницах сайта.

type GameType =
  | "alphabet-placeholder"
  | "picture-match"
  | "spell-word"
  | "syllables"
  | "sentence-game"
  | "audio-picture"
  | "audio-sentence"
  | "calculator";

// sector — необязательный номер сектора колеса (0–11). Если не задан,
// игра стоит в секторе, равном её месту в списке. «Калькулятор» стоит
// строго в 12-м секторе (индекс 11), секторы 8–11 остаются пустыми.
type GameDef = { type: GameType; icon: string; label: string; sector?: number };

function getGamesForLanguage(language: string): GameDef[] {
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
    { type: "calculator", icon: "🧮", label: "Калькулятор", sector: SECTOR_COUNT - 1 },
  ];
}

const gameSector = (game: GameDef, index: number) => game.sector ?? index;

function getGameWheelLabels(games: GameDef[]): string[][] {
  const labels: string[][] = Array.from({ length: SECTOR_COUNT }, () => []);
  games.forEach((game, i) => {
    labels[gameSector(game, i)] = [game.icon, game.label];
  });
  return labels;
}

type ViewState =
  | "main"
  | "games"
  | "shastra"
  | "shastra-verse"
  | "riddles"
  | "sambandha"
  | "prakriti"
  | "prakriti-sentence"
  | "abhidheya"
  | "prayojana"
  | "guide-info"
  | "stable"
  | "stable-game"
  | "properties"
  | "properties-menu"
  | "path"
  | "path-ready"
  | "features";

// ⚠️ ДОБАВЛЕНО: откуда был открыт экран "path-ready" — от этого зависит,
// куда ведёт кнопка «← Назад».
//  • "path"      — из колеса «Начало пути по сайту» («Уже готово для вас»);
//  • "sambandha" — из колеса «Самбандха» (сектор «Джива»).
type PathReadyOrigin = "path" | "sambandha";

interface HomePageProps {
  // Ключ кнопки, выбранной на заставке SplashGate (см. комментарий
  // выше файла) — "your-page" | "site-page" | "languages" | "stable".
  // Необязательный: при обычном заходе (не через заставку) не
  // передаётся, и HomePage ведёт себя как раньше.
  initialFooterKey?: string;
}

export default function HomePage({ initialFooterKey }: HomePageProps = {}) {
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

  // Приветственное окно после входа/регистрации на странице /auth:
  // страница отправляет сюда с параметром welcome=1. Показываем один раз
  // и убираем параметр из адреса, чтобы окно не появлялось при обновлении.
  const search = useSearch();
  const [showWelcome, setShowWelcome] = useState(
    () => new URLSearchParams(search).get("welcome") === "1"
  );
  const closeWelcome = () => {
    setShowWelcome(false);
    window.history.replaceState(null, "", "/?skipSplash=true");
  };

  const games = useMemo(() => getGamesForLanguage(language), [language]);
  const gameWheelLabels = useMemo(() => getGameWheelLabels(games), [games]);

  // Колесо «Свойства сайта»: кликабельные сектора показываются всем
  // пользователям.
  const propertiesWheelLabels = PROPERTIES_WHEEL_LABELS;

  const propertiesClickableIndices = [
    PROPERTIES_PATH_INDEX,
    PROPERTIES_MENU_INDEX,
    PROPERTIES_FEATURES_INDEX,
    PROPERTIES_SUPPORT_INDEX,
  ];

  // "main" — колесо тем (категорий), "games" — колесо с 7 играми.
  // "shastra" — форма ввода song/chapter/text, "shastra-verse" —
  // экран со стихом. "riddles" — экран с загадками для детей.
  // "sambandha"/"abhidheya"/"prayojana" — колёса из
  // трёх кнопок хедера. "prakriti" — колесо из 12 предложений
  // (подраздел «Пракрити» раздела «Самбандха»), "prakriti-sentence" —
  // экран с выбранным предложением. "guide-info" — экран оплаты («Хочу
  // поддержать проект»). "stable" — колесо «Предмет изучения» (первый
  // сектор — игра), "stable-game" — экран с личным результатом игры.
  const [view, setView] = useState<ViewState>("main");

  // ⚠️ ДОБАВЛЕНО: источник, из которого открыт экран "path-ready"
  // (см. тип PathReadyOrigin и handleBack).
  const [pathReadyOrigin, setPathReadyOrigin] = useState<PathReadyOrigin>("path");

  // ─── Состояние «Шастры» ──────────────────────────────────────────────────
  // Значения полей формы храним строками (так удобнее для <input>);
  // в запрос они уходят числами (song, chapter) и текстом (text —
  // номер стиха). Имена переменных (cantoInput, verseInput) оставлены
  // прежними, в базу они уходят под колонками song / text.
  const [shastraKey, setShastraKey] = useState<string>("bhagavad_gita");
  const [cantoInput, setCantoInput] = useState<string>("0");
  const [chapterInput, setChapterInput] = useState<string>("1");
  const [verseInput, setVerseInput] = useState<string>("1");
  const [shastraLoading, setShastraLoading] = useState(false);
  const [shastraError, setShastraError] = useState<string | null>(null);
  // Две строки: из таблицы письменностей и из таблицы языков.
  const [scriptsRow, setScriptsRow] = useState<ShastraRow | null>(null);
  const [languagesRow, setLanguagesRow] = useState<ShastraRow | null>(null);
  // Выбранные на экране стиха письменность и язык (по умолчанию —
  // деванагари и русский).
  const [selectedScript, setSelectedScript] = useState<string>("devanagari");
  const [selectedLanguage, setSelectedLanguage] = useState<string>("ru");

  // Кнопка «Показать стих»: читаем стих из обеих таблиц и открываем
  // экран "shastra-verse".
  const handleShastraSubmit = async () => {
    const canto = Number(cantoInput);
    const chapter = Number(chapterInput);
    const verse = verseInput.trim();

    if (
      cantoInput.trim() === "" ||
      chapterInput.trim() === "" ||
      verse === "" ||
      !Number.isInteger(canto) ||
      !Number.isInteger(chapter) ||
      canto < 0 ||
      chapter < 0
    ) {
      // ⚠️ ПРАВКА: сообщение без английских названий полей.
      setShastraError("Введите песнь и главу целыми числами, а также номер стиха.");
      return;
    }

    setShastraLoading(true);
    setShastraError(null);
    try {
      // ⚠️ ПРАВКА: в базе колонки называются song и text (а не
      // canto и verse). Локальные переменные canto/verse остались
      // прежними, меняются только имена колонок в запросе.
      const fetchRow = (table: string) =>
        supabase
          .from(table)
          .select("*")
          .eq("shastra", shastraKey)
          .eq("song", canto)
          .eq("chapter", chapter)
          .eq("text", verse)
          .maybeSingle();

      const [scriptsResult, languagesResult] = await Promise.all([
        fetchRow("text_shastra_writting_systems"),
        fetchRow("text_shastra_languages"),
      ]);

      if (scriptsResult.error || languagesResult.error) {
        setShastraError(
          (scriptsResult.error ?? languagesResult.error)?.message ??
            "Не удалось загрузить стих."
        );
        return;
      }
      if (!scriptsResult.data && !languagesResult.data) {
        setShastraError("Такой стих пока не найден в базе.");
        return;
      }

      setScriptsRow((scriptsResult.data ?? null) as ShastraRow | null);
      setLanguagesRow((languagesResult.data ?? null) as ShastraRow | null);
      setView("shastra-verse");
    } catch (e) {
      setShastraError(e instanceof Error ? e.message : String(e));
    } finally {
      setShastraLoading(false);
    }
  };

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

  // Колесо «Самбандха»: «Джива» открывает экран с формой SortRequestForm
  // (view "path-ready"), «Пракрити» — колесо из 12 предложений.
  const handleSambandhaSectorClick = (index: number) => {
    if (index === JIVA_INDEX) {
      // ⚠️ ПРАВКА: запоминаем, что экран открыт из «Самбандхи», чтобы
      // «← Назад» вернул на это же колесо.
      setPathReadyOrigin("sambandha");
      setView("path-ready");
    } else if (index === PRAKRITI_INDEX) {
      setView("prakriti");
    }
  };

  const handlePrakritiSectorClick = (index: number) => {
    if (prakritiSentences[index]) {
      setSelectedSentenceIndex(index);
      setView("prakriti-sentence");
    }
  };

  // Главное колесо («Домашняя страница»): сектор №1 — «Игры»,
  // сектор №2 — «Шастра», сектор №3 — «Загадки».
  const handleSelectCategory = (index: number) => {
    if (index === 0) {
      setView("games");
    } else if (index === SHASTRA_INDEX) {
      // ⚠️ ПРАВКА: кнопка «Шастра» открывает форму song/chapter/text.
      setShastraError(null);
      setView("shastra");
    } else if (index === RIDDLES_INDEX) {
      // ⚠️ ДОБАВЛЕНО: кнопка «Загадки» открывает экран с загадками.
      setView("riddles");
    }
  };

  const handleGameSectorClick = (index: number) => {
    const game = games.find((g, i) => gameSector(g, i) === index);
    if (game) {
      setLocation(`/game?game=${game.type}`);
    }
  };

  // Кнопка «Меню» (сектор №2 колеса «Свойства сайта») → колесо с
  // выбором языка / системы письменности.
  const handleMenuClick = () => {
    setView("properties-menu");
  };

  // Колесо «Предмет изучения»: первый сектор — игра (название и значок
  // как в колесе игр), остальные пустые. Нажатие открывает экран с
  // личным результатом игры (view "stable-game").
  const stableGame = games[0];
  const stableWheelLabels = useMemo(
    () =>
      Array.from({ length: SECTOR_COUNT }, (_, i) =>
        i === 0 ? gameWheelLabels[0] ?? [] : []
      ),
    [gameWheelLabels]
  );
  const handleStableSectorClick = (index: number) => {
    if (index === 0) setView("stable-game");
  };

  // Колесо «Свойства сайта»: сектор №1 — «Начало пути по сайту»,
  // сектор №2 — «Меню», сектор №3 — «Узнать возможности сайта»,
  // сектор №11 — «Регистрация и авторизация» (для авторизованного —
  // выход из аккаунта), сектор №12 — «Хочу поддержать проект» (экран
  // с оплатой, "guide-info").
  const handlePropertiesSectorClick = (index: number) => {
    if (index === PROPERTIES_PATH_INDEX) {
      // ⚠️ ПРАВКА: кнопка «Начало пути по сайту» открывает колесо
      // обозрения из 12 секторов (view "path").
      setView("path");
    } else if (index === PROPERTIES_MENU_INDEX) {
      handleMenuClick();
    } else if (index === PROPERTIES_FEATURES_INDEX) {
      setView("features");
    } else if (index === PROPERTIES_SUPPORT_INDEX) {
      setView("guide-info");
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

  // Колесо «Начало пути по сайту»: сектор №1 — «Уже готово для вас».
  const handlePathSectorClick = (index: number) => {
    if (index === PATH_READY_INDEX) {
      // ⚠️ ПРАВКА: «Уже готово для вас» открывает экран с формой
      // поиска (view "path-ready"). Источник — «Начало пути по сайту».
      setPathReadyOrigin("path");
      setView("path-ready");
    }
  };

  // ⚠️ ЗАГОТОВКА: кнопка «Сортировка по запросу» в SortRequestForm
  // передаёт сюда значения полей: values.age / values.topic /
  // values.section — номера из списков ("1", "2", "3" …) или ""
  // (если поле не выбрано). Пока она ничего не показывает — логику
  // (какие темы выводить первыми) добавим позже.
  const handlePathSortClick = (values: SortValues) => {
    console.debug("[path] сортировка по запросу:", values);
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
      !["languages", "your-page"].includes(key)
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
      // «Свойства сайта» (заставка и футер) → колесо с кнопками
      // «Начало пути по сайту» и «Меню».
      // (Раньше здесь открывалось колесо "dictionary" — код этого
      // колеса оставлен ниже, но сейчас оно ни из чего не открывается.)
      setView("properties");
    } else if (key === "stable") {
      // «Предмет изучения» → колесо, в первом секторе которого игра.
      setView("stable");
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

  const footerItems = footerNav;

  // "← Назад" на любом колесе, кроме колеса тем ("main"), обычно
  // возвращает на колесо тем (домашний экран). Исключения:
  //  • "guide-info" → "properties" (экран оплаты открывается из
  //    сектора «Хочу поддержать проект»);
  //  • "stable-game" → "stable" (обратно в «Предмет изучения»);
  //  • "properties-menu", "features" → "properties"
  //    (обратно в «Свойства сайта»);
  //  • "path" → "properties";
  //  • "path-ready" → туда, откуда открыт (pathReadyOrigin):
  //    "path" (колесо «Начало пути по сайту») или
  //    "sambandha" (колесо «Самбандха», сектор «Джива»);
  //  • "prakriti" → "sambandha" (обратно в колесо «Самбандха»);
  //  • "prakriti-sentence" → "prakriti" (обратно в колесо предложений);
  //  • "shastra" → "main" (общее правило: обратно на колесо тем);
  //  • "riddles" → "main" (общее правило: обратно на колесо тем);
  //  • "shastra-verse" → "shastra" (обратно в форму ввода стиха).
  const handleBack = () => {
    if (view === "guide-info") {
      setView("properties");
    } else if (view === "stable-game") {
      setView("stable");
    } else if (
      view === "properties-menu" ||
      view === "path" ||
      view === "features"
    ) {
      setView("properties");
    } else if (view === "path-ready") {
      // ⚠️ ПРАВКА: раньше всегда возвращало в "path".
      setView(pathReadyOrigin);
    } else if (view === "prakriti") {
      setView("sambandha");
    } else if (view === "prakriti-sentence") {
      setView("prakriti");
    } else if (view === "shastra-verse") {
      setView("shastra");
    } else {
      setView("main");
    }
  };

  const selectedSentence =
    selectedSentenceIndex !== null ? prakritiSentences[selectedSentenceIndex] : null;

  // Общий вид полей формы «Шастра» и выпадающих списков на экране стиха.
  const SHASTRA_FIELD_CLASS =
    "px-3 py-2 rounded-xl border-2 bg-white font-bold text-base outline-none";

  // Текст стиха для выбранного сочетания: сначала письменность
  // (санскрит в выбранной системе письма), под ней — перевод на
  // выбранный язык.
  const verseScriptText = scriptsRow ? (scriptsRow[selectedScript] as string | null) : null;
  const verseLanguageText = languagesRow
    ? (languagesRow[selectedLanguage] as string | null)
    : null;

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
            style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
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

        {view === "riddles" && <RiddlesView />}

        {view === "shastra" && (
          // ⚠️ ДОБАВЛЕНО: форма «Шастра» — выбор шастры и три поля:
          // песнь (song), глава (chapter) и номер стиха (text);
          // по умолчанию 0, 1, 1.
          <div className="w-full h-full flex items-start justify-center px-4 pt-4 bg-white overflow-y-auto">
            <div className="flex flex-col items-center gap-4 w-full max-w-md text-center">
              <p className="text-xl font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
                Шастра
              </p>

              <label className="flex flex-col gap-1 w-full text-left font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
                Шастра
                <select
                  value={shastraKey}
                  onChange={(e) => setShastraKey(e.target.value)}
                  className={SHASTRA_FIELD_CLASS}
                  style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
                >
                  {SHASTRA_OPTIONS.map((o) => (
                    <option key={o.key} value={o.key}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex flex-col gap-1 w-full text-left font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
                Песнь (для Бхагавад-гиты — 0)
                <input
                  type="number"
                  min={0}
                  value={cantoInput}
                  onChange={(e) => setCantoInput(e.target.value)}
                  className={SHASTRA_FIELD_CLASS}
                  style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
                />
              </label>

              <label className="flex flex-col gap-1 w-full text-left font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
                Глава
                <input
                  type="number"
                  min={0}
                  value={chapterInput}
                  onChange={(e) => setChapterInput(e.target.value)}
                  className={SHASTRA_FIELD_CLASS}
                  style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
                />
              </label>

              <label className="flex flex-col gap-1 w-full text-left font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
                Номер стиха
                <input
                  type="text"
                  value={verseInput}
                  onChange={(e) => setVerseInput(e.target.value)}
                  className={SHASTRA_FIELD_CLASS}
                  style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
                />
              </label>

              {shastraError && (
                <p className="text-base" style={{ color: WHEEL_TEXT_COLOR }} role="alert">
                  {shastraError}
                </p>
              )}

              <button
                onClick={handleShastraSubmit}
                disabled={shastraLoading}
                className="px-6 py-3 rounded-full border-2 font-bold text-base transition bg-white"
                style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
              >
                {shastraLoading ? "Загрузка…" : "Показать стих"}
              </button>
            </div>
          </div>
        )}

        {view === "shastra-verse" && (
          // ⚠️ ДОБАВЛЕНО: отдельная страница стиха. Два выпадающих
          // списка (письменность и язык) — 12 × 12 сочетаний; текст
          // стиха — в одном поле.
          <div className="w-full h-full flex items-start justify-center px-4 pt-4 bg-white overflow-y-auto">
            <div className="flex flex-col items-center gap-4 w-full max-w-2xl">
              <p className="text-xl font-bold text-center" style={{ color: WHEEL_TEXT_COLOR }}>
                {SHASTRA_OPTIONS.find((o) => o.key === shastraKey)?.label}
                {" · "}
                {shastraKey === "srimad_bhagavatam" ? `Песнь ${cantoInput}, ` : ""}
                Глава {chapterInput}, Текст {verseInput}
              </p>

              <div className="flex flex-wrap items-center justify-center gap-3 w-full">
                <label className="flex flex-col gap-1 font-bold text-left" style={{ color: WHEEL_TEXT_COLOR }}>
                  Письменность
                  <select
                    value={selectedScript}
                    onChange={(e) => setSelectedScript(e.target.value)}
                    className={SHASTRA_FIELD_CLASS}
                    style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
                  >
                    {SHASTRA_SCRIPTS.map((s) => (
                      <option key={s.column} value={s.column}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="flex flex-col gap-1 font-bold text-left" style={{ color: WHEEL_TEXT_COLOR }}>
                  Язык
                  <select
                    value={selectedLanguage}
                    onChange={(e) => setSelectedLanguage(e.target.value)}
                    className={SHASTRA_FIELD_CLASS}
                    style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
                  >
                    {SHASTRA_LANGUAGES.map((l) => (
                      <option key={l.column} value={l.column}>
                        {l.label}
                      </option>
                    ))}
                  </select>
                </label>
              </div>

              {/* Одно поле для стиха: письменность + перевод. */}
              <div
                className="w-full rounded-3xl border-4 p-5 flex flex-col gap-4"
                style={{ borderColor: "#FFD700", color: WHEEL_TEXT_COLOR }}
              >
                <p className="text-lg font-bold" style={{ whiteSpace: "pre-line" }}>
                  {verseScriptText ?? "Этого варианта письменности пока нет в базе."}
                </p>
                <p className="text-base" style={{ whiteSpace: "pre-line" }} dir="auto">
                  {verseLanguageText ?? "Этого языка пока нет в базе."}
                </p>
              </div>
            </div>
          </div>
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
              <p className="text-lg" style={{ color: WHEEL_TEXT_COLOR }}>
                Загрузка…
              </p>
            )}
            {prakritiError && (
              <p className="text-lg text-center px-4" style={{ color: WHEEL_TEXT_COLOR }} role="alert">
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
            <p className="text-2xl font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
              {selectedSentence.sentence_text}
            </p>
          </div>
        )}

        {view === "properties" && (
          <Wheel12
            labels={propertiesWheelLabels}
            centerLabel="Свойства сайта"
            clickableIndices={propertiesClickableIndices}
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

        {view === "path" && (
          <Wheel12
            labels={PATH_WHEEL_LABELS}
            centerLabel="Начало пути по сайту"
            clickableIndices={PATH_WHEEL_CLICKABLE_INDICES}
            onSectorClick={handlePathSectorClick}
          />
        )}

        {view === "path-ready" && (
          // ⚠️ ПРАВКА: вместо собственной формы — общий компонент
          // SortRequestForm. Белый фон, отступ сверху и положение на
          // странице задаёт эта обёртка (сам компонент рисует только
          // ряд полей и кнопку).
          <div className="w-full h-full flex items-start justify-center px-4 pt-4 bg-white overflow-y-auto">
            <SortRequestForm onSubmit={handlePathSortClick} />
          </div>
        )}

        {view === "abhidheya" && (
          <Wheel12 labels={ABHIDHEYA_WHEEL_LABELS} centerLabel="Абхидхея" />
        )}

        {view === "prayojana" && (
          <Wheel12 labels={PRAYOJANA_WHEEL_LABELS} centerLabel="Прайоджана" />
        )}

        {view === "stable" && (
          <Wheel12
            labels={stableWheelLabels}
            centerLabel="Предмет изучения"
            clickableIndices={[0]}
            onSectorClick={handleStableSectorClick}
          />
        )}

        {view === "stable-game" && (
          <div className="flex flex-col items-center justify-center gap-5 max-w-lg text-center px-4">
            <p className="text-xl font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
              {stableGame.icon} {stableGame.label}
            </p>
            {!isAuthenticated ? (
              <>
                <p className="text-base" style={{ color: WHEEL_TEXT_COLOR }}>
                  Войдите или зарегистрируйтесь, чтобы сохранять личные
                  результаты игры.
                </p>
                <button
                  onClick={() => setLocation("/auth")}
                  className="px-6 py-3 rounded-full border-2 font-bold text-base transition bg-white"
                  style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
                >
                  Регистрация и авторизация
                </button>
              </>
            ) : (
              (() => {
                const saved = getSavedResult(user?.id, stableGame.type);
                return saved ? (
                  <p className="text-base" style={{ color: WHEEL_TEXT_COLOR }}>
                    Ваш личный результат: {saved.score}
                    <br />
                    <span className="text-sm">
                      сохранён {new Date(saved.savedAt).toLocaleDateString("ru-RU")}
                    </span>
                  </p>
                ) : (
                  <p className="text-base" style={{ color: WHEEL_TEXT_COLOR }}>
                    Личный результат ещё не сохранён. Сыграйте и нажмите
                    значок дискеты в шапке игры.
                  </p>
                );
              })()
            )}
            <button
              onClick={() => setLocation(`/game?game=${stableGame.type}`)}
              className="px-6 py-3 rounded-full border-2 font-bold text-base transition bg-white"
              style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
            >
              Играть
            </button>
          </div>
        )}

        {view === "guide-info" && (
          <div className="flex flex-col items-center justify-center gap-6 max-w-lg text-center px-4">
            <p className="text-lg" style={{ color: WHEEL_TEXT_COLOR }}>
              Примите благодарность за поддержку служения сайта
            </p>
            <button
              onClick={() => setLocation("/payments")}
              className="px-6 py-3 rounded-full border-2 font-bold text-base transition bg-white"
              style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
            >
              Перейти к оплате
            </button>
          </div>
        )}

        {view === "features" && (
          <div className="flex flex-col items-center justify-center gap-5 max-w-lg text-center px-4">
            <p className="text-lg font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
              Пользование сервисом сайта предоставляется с момента оплаты
            </p>
            <p className="text-base" style={{ color: WHEEL_TEXT_COLOR }}>
              Нажмите «Перейти к оплате», выберите способ и следуйте подсказкам.
              После подтверждения платежа все разделы и игры откроются.
            </p>
            <button
              onClick={() => setLocation("/payments")}
              className="px-6 py-3 rounded-full border-2 font-bold text-base transition bg-white"
              style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
            >
              Перейти к оплате
            </button>
          </div>
        )}
      </div>

      {showWelcome && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.45)" }}
          role="dialog"
          aria-modal="true"
        >
          <div
            className="bg-white rounded-3xl border-4 p-6 w-full max-w-md text-center flex flex-col gap-4"
            style={{ borderColor: "#FFD700" }}
          >
            <p className="text-xl font-bold" style={{ color: WHEEL_TEXT_COLOR }}>
              Добро пожаловать{isAuthenticated ? `, ${getWelcomeName(user)}` : ""}!
            </p>
            <p className="text-base" style={{ color: WHEEL_TEXT_COLOR }}>
              Чтобы продолжить увлекательное путешествие по сайту, выберите в
              шапке раздел, который вас заинтересует.
            </p>
            <p className="text-base" style={{ color: WHEEL_TEXT_COLOR }}>
              После оплаты на колесе «Свойства сайта» откроются все сервисы
              сайта.
            </p>
            <button
              onClick={closeWelcome}
              className="px-6 py-3 rounded-full border-2 font-bold text-base transition bg-white"
              style={{ color: WHEEL_TEXT_COLOR, borderColor: "#FFD700" }}
            >
              Понятно
            </button>
          </div>
        </div>
      )}
    </WheelPageShell>
  );
}