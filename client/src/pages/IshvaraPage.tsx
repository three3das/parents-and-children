import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "wouter";
import { useLanguage, LANGUAGE_FLAGS } from "@/lib/i18n";
import { useAuth, getWelcomeName } from "@/lib/auth";
import { headerNav, footerNav } from "@/lib/siteNav";

// headerNav и footerNav теперь берутся из общего файла "@/lib/siteNav" —
// раньше здесь были свои локальные копии этих массивов, из-за чего
// порядок и подписи футера расходились с PaymentsPage.tsx (тот уже
// импортировал footerNav из siteNav.ts). Теперь обе страницы используют
// один и тот же источник — расхождение исключено.

// Список языков для колеса языкового меню — 12 секторов, по часовой
// стрелке, начиная с 12 часов, в заданном порядке.
// Санскрит стоит первым и является языком по умолчанию (см. DEFAULT_LANGUAGE ниже).
//
// ⚠️ Раньше коды были перепутаны с подписями (например, code: "hi" стоял
// напротив label: "Английский") — похоже, подписи в какой-то момент
// отсортировали по алфавиту, а коды остались в старом порядке. Из-за
// этого клик по сектору "Английский" на самом деле выставлял язык "hi",
// а два сектора вообще ссылались на коды ("de", "zh"), которых нет ни
// в таблице public.letter_writing_systems, ни в типе Language. Порядок
// подписей (по часовой стрелке) не менялся — только коды приведены в
// соответствие с public.letter_writing_systems.sort_order в Supabase.
const languageOptions = [
  { code: "sa", label: "Санскрит" },
  { code: "en", label: "Английский" },
  { code: "ar", label: "Арабский" },
  { code: "bn", label: "Бенгальский" },
  { code: "id", label: "Индонезийский" },
  { code: "es", label: "Испанский" },
  { code: "pt", label: "Португальский" },
  { code: "ru", label: "Русский" },
  { code: "uk", label: "Украинский" },
  { code: "ur", label: "Урду" },
  { code: "fr", label: "Французский" },
  { code: "hi", label: "Хинди" },
];

// Язык по умолчанию — Санскрит. Именно он должен быть активен изначально,
// пока пользователь не выберет другой язык в колесе.
const DEFAULT_LANGUAGE = "sa";

// ⚠️ ДОБАВЛЕНО: та же пара словарей (первая буква алфавита / слово
// "алфавит" на языке), что используется в GameMenu.tsx для кнопки
// режима "alphabet-placeholder". Здесь они нужны по той же причине —
// сектор "Алфавит" колеса игр должен показывать актуальные для
// текущего выбранного языка сайта букву и подпись, а не всегда
// зафиксированные "🔤"/"Алфавит". При смене языка через колесо
// "Языки" (view === "languages") этот сектор колеса игр
// (GAME_WHEEL_LABELS[0]) пересчитывается автоматически — см.
// getGameWheelLabels()/gameWheelLabels ниже.
const FIRST_LETTER: Record<string, string> = {
  sa: 'अ',
  hi: 'अ',
  en: 'A',
  es: 'A',
  pt: 'A',
  fr: 'A',
  id: 'A',
  ru: 'А',
  uk: 'А',
  ar: 'ا',
  ur: 'ا',
  bn: 'অ',
};

const ALPHABET_LABEL: Record<string, string> = {
  sa: 'वर्णमाला',
  hi: 'वर्णमाला',
  en: 'Alphabet',
  es: 'Alfabeto',
  pt: 'Alfabeto',
  fr: 'Alphabet',
  id: 'Alfabet',
  ru: 'Алфавит',
  uk: 'Алфавіт',
  ar: 'الأبجدية',
  ur: 'حروف تہجی',
  bn: 'বর্ণমালা',
};

// Список систем письменности для второго колеса. Теперь оба колеса
// (языки и системы письменности) — два РАВНОПРАВНЫХ раздела, которые
// выбираются напрямую из выпадающего меню кнопки "Меню" в футере (см.
// isMenuOpen/handleSelectMenuOption ниже), а не идут друг за другом по
// кругу, как раньше. Порядок и состав секторов не менялся.
const scriptOptions = [
  { code: "devanagari", label: "Деванагари" },
  { code: "cyrillic", label: "Кириллица" },
  { code: "latin", label: "Латиница" },
  { code: "arabic", label: "Арабское письмо" },
  { code: "chinese", label: "Китайские иероглифы" },
  { code: "japanese", label: "Японское письмо" },
  { code: "korean", label: "Корейский хангыль" },
  { code: "bengali", label: "Бенгальское письмо" },
  { code: "tamil", label: "Тамильское письмо" },
  { code: "greek", label: "Греческое письмо" },
  { code: "hebrew", label: "Еврейское письмо" },
  { code: "georgian", label: "Грузинское письмо" },
];

// --- Яркие золотые цвета ---
const GOLD = { r: 255, g: 215, b: 0 };
const WHITE = { r: 255, g: 255, b: 255 };

function mix(goldPct: number) {
  const r = Math.round(GOLD.r * goldPct + WHITE.r * (1 - goldPct));
  const g = Math.round(GOLD.g * goldPct + WHITE.g * (1 - goldPct));
  const b = Math.round(GOLD.b * goldPct + WHITE.b * (1 - goldPct));
  return `rgb(${r},${g},${b})`;
}

const COLOR_33 = mix(0.33);
const COLOR_67 = mix(0.67);
const COLOR_100 = mix(1.0);

function sectorColor(i: number) {
  const m = i % 3;
  if (m === 0) return COLOR_33;
  if (m === 1) return COLOR_67;
  return COLOR_100;
}

const SECTOR_COUNT = 12;
const CX = 250;
const CY = 250;
const R = 250;

const toRad = (deg: number) => (deg * Math.PI) / 180;

const MM_TO_UNITS = 96 / 25.4;
const EDGE_GAP_MM = 2;
const GAP = EDGE_GAP_MM * MM_TO_UNITS;

const HALF_ANGLE = toRad(360 / SECTOR_COUNT / 2);
const SIN_HALF = Math.sin(HALF_ANGLE);

const BADGE_R =
  (R * SIN_HALF - GAP * (SIN_HALF + 1)) / (1 + SIN_HALF);
const BADGE_RADIUS = R - BADGE_R - GAP;

const LABEL_FONT_SIZE = 8.4;

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

// Страница "Словарь используемых на сайте слов" (открывается по кнопке
// "Страница сайта" в футере). Заполнен только первый кружок — остальные
// 11 оставлены пустыми.
const DICTIONARY_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) =>
    i === 0
      ? ["Словарь", "используемых", "на сайте", "слов"]
      : []
);

// --- Категории в самом колесе, которое и так открывается первым ---
//
// Раньше 5 категорий были кнопками в отдельной панели над колесом,
// а колесо ниже показывало отдельное содержимое (MAIN_WHEEL_LABELS).
// Теперь это ОДНО и то же колесо: та же переменная view === "main",
// никакого нового экрана/состояния не добавлено — просто в первых
// секторах (по часовой стрелке от 12 часов) теперь разделы сайта,
// а клик по активному сектору работает так же, как раньше клик по
// кнопке (открывает раздел).
//
// Порядок и статус секторов:
//   1. Игры — единственный по-настоящему рабочий раздел на данный
//      момент: подсвечен золотым (активен), клик открывает колесо
//      с 7 играми (см. GAME_WHEEL_LABELS ниже).
//   2. Аюр-веда — заглушка (раздел ещё не реализован).
//   3. Джйотиш — заглушка.
//   4–7. Астрология, Здоровье, Природа Материального мира,
//      Творчество — прежние 4 категории из старой панели кнопок,
//      тоже пока заглушки.
// Сектора 8–12 остаются пустыми белыми — без подписи и без функции.
//
// Длинные подписи ("Природа Материального мира") разбиты на строки
// по 2 слова, чтобы влезать в сектор, как и у остальных колёс сайта.
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
  "Аюр-веда",
  "Джйотиш",
  "Астрология",
  "Здоровье",
  "Природа Материального мира",
  "Творчество",
];

// Только первый сектор ("Игры") сейчас кликабелен — остальные
// перечисленные выше показаны как заглушки (подпись видна, но клик
// по ним ничего не делает), а сектора 8–12 не заполнены вовсе.
const CATEGORY_CLICKABLE_INDICES = [0];

const CATEGORY_WHEEL_LABELS: string[][] = Array.from(
  { length: SECTOR_COUNT },
  (_, i) => (i < CATEGORY_ITEMS.length ? splitLabelIntoLines(CATEGORY_ITEMS[i]) : [])
);

// --- Колесо игр ---
//
// Все 7 игр, найденные в GameMenu.tsx (тип GameType из "@shared/schema"),
// в том же порядке, что и в массиве gameTypes. Заполнены только первые
// 7 секторов (по часовой стрелке от 12 часов) — оставшиеся 5 пустые.
// Открывается по клику на активный сектор "Игры" колеса категорий.
//
// ⚠️ ПРАВКА: раньше первый элемент ("alphabet-placeholder") всегда
// показывал зафиксированные иконку "🔤" и подпись "Алфавит" — как и
// остальные 6 игр, GAMES был статичным массивом верхнего уровня, не
// зависящим от языка интерфейса. Теперь GAMES вынесен внутрь функции
// getGamesForLanguage(language), которая подставляет для первого
// элемента актуальные для текущего языка букву (FIRST_LETTER) и слово
// "алфавит" (ALPHABET_LABEL) — по тому же принципу, что и кнопка
// "alphabet-placeholder" в GameMenu.tsx. Остальные 6 игр не зависят от
// языка и не меняются.
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

function Wheel12({
  labels,
  centerLabel,
  onSectorClick,
  activeIndex,
  clickableIndices,
}: {
  labels: string[][];
  centerLabel: string;
  onSectorClick?: (index: number) => void;
  activeIndex?: number;
  // Необязательный список индексов, которые можно кликать. Если не
  // задан — кликабелен любой сектор с подписью (прежнее поведение,
  // используется колёсами языков/письменности/словаря/игр, где все
  // заполненные сектора действуют одинаково). Колесо категорий
  // передаёт сюда [0] — рабочий раздел один ("Игры"), остальные
  // подписанные сектора — заглушки без реакции на клик.
  clickableIndices?: number[];
}) {
  return (
    <div className="relative aspect-square h-full max-h-full max-w-full">
      <svg viewBox="0 0 500 500" className="w-full h-full">
        {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
          const angle = (360 / SECTOR_COUNT) * i;
          const nextAngle = (360 / SECTOR_COUNT) * (i + 1);
          const x1 = CX + R * Math.sin(toRad(angle));
          const y1 = CY - R * Math.cos(toRad(angle));
          const x2 = CX + R * Math.sin(toRad(nextAngle));
          const y2 = CY - R * Math.cos(toRad(nextAngle));
          const fill = sectorColor(i);
          return (
            <path
              key={i}
              d={`M${CX},${CY} L${x1},${y1} A${R},${R} 0 0,1 ${x2},${y2} Z`}
              fill={fill}
            />
          );
        })}

        {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
          const midAngle =
            (360 / SECTOR_COUNT) * i + 360 / SECTOR_COUNT / 2;
          const bx = CX + BADGE_RADIUS * Math.sin(toRad(midAngle));
          const by = CY - BADGE_RADIUS * Math.cos(toRad(midAngle));
          // Сектор кликабелен, если для него задан обработчик, у него
          // есть подпись, и (если передан clickableIndices) его индекс
          // входит в этот список.
          const hasLabel = (labels[i] || []).length > 0;
          const allowedByList = !clickableIndices || clickableIndices.includes(i);
          const clickable = Boolean(onSectorClick) && hasLabel && allowedByList;
          const isActive = i === activeIndex;
          return (
            <circle
              key={`badge-${i}`}
              cx={bx}
              cy={by}
              r={BADGE_R}
              fill={isActive ? "#FFD700" : "#FFFFFF"}
              stroke="#FFD700"
              strokeWidth={3}
              style={clickable ? { cursor: "pointer" } : undefined}
              onClick={clickable ? () => onSectorClick!(i) : undefined}
            />
          );
        })}

        {Array.from({ length: SECTOR_COUNT }).map((_, i) => {
          const midAngle =
            (360 / SECTOR_COUNT) * i + 360 / SECTOR_COUNT / 2;
          const bx = CX + BADGE_RADIUS * Math.sin(toRad(midAngle));
          const by = CY - BADGE_RADIUS * Math.cos(toRad(midAngle));
          const lines = labels[i] || [];
          const hasLabel = lines.length > 0;
          const allowedByList = !clickableIndices || clickableIndices.includes(i);
          const clickable = Boolean(onSectorClick) && hasLabel && allowedByList;
          const isActive = i === activeIndex;

          const firstDy =
            lines.length === 1
              ? "0.32em"
              : lines.length === 2
              ? "-0.5em"
              : lines.length === 3
              ? "-1.1em"
              : lines.length === 4
              ? "-1.7em"
              : "0em";

          return (
            <text
              key={`label-${i}`}
              x={bx}
              y={by}
              textAnchor="middle"
              fontSize={LABEL_FONT_SIZE}
              fontWeight="bold"
              fontFamily="ui-sans-serif, system-ui, sans-serif"
              fill={isActive ? "#FFFFFF" : "#FFD700"}
              style={clickable ? { cursor: "pointer" } : undefined}
              onClick={clickable ? () => onSectorClick!(i) : undefined}
            >
              {lines.map((line, li) => (
                <tspan key={li} x={bx} dy={li === 0 ? firstDy : "1.2em"}>
                  {line}
                </tspan>
              ))}
            </text>
          );
        })}
      </svg>

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="px-6 py-3 rounded-full border-[3px] border-yellow-400 bg-white font-bold text-xl"
          style={{ color: "#FFD700" }}
        >
          {centerLabel}
        </div>
      </div>
    </div>
  );
}

// Колесо выбора языка: 12 секторов (те же цвета/позиции, что и у
// основного колеса), в каждом секторе — название одного языка.
// Активный (выбранный) язык подсвечивается золотой заливкой кружка.
// Изначально (до выбора пользователем) активным считается Санскрит —
// см. DEFAULT_LANGUAGE и эффект инициализации в IshvaraPage.
function LanguagesWheelView({
  activeLanguage,
  onSelectLanguage,
}: {
  activeLanguage: string;
  onSelectLanguage: (code: string) => void;
}) {
  const labels = languageOptions.map((lang) => [lang.label]);
  const activeIndex = languageOptions.findIndex(
    (lang) => lang.code === activeLanguage
  );
  const activeLabel =
    activeIndex >= 0 ? languageOptions[activeIndex].label : "Язык";

  return (
    <Wheel12
      labels={labels}
      centerLabel={activeLabel}
      activeIndex={activeIndex >= 0 ? activeIndex : undefined}
      onSectorClick={(index) => onSelectLanguage(languageOptions[index].code)}
    />
  );
}

// Колесо выбора системы письменности — открывается напрямую из пункта
// "Системы письменности" выпадающего меню кнопки "Меню" (см.
// handleSelectMenuOption в IshvaraPage). Выбор здесь не меняет язык
// интерфейса — только закрывает колесо и возвращает на главное.
function ScriptsWheelView({
  onSelectScript,
}: {
  onSelectScript: (code: string) => void;
}) {
  const labels = scriptOptions.map((s) => [s.label]);

  return (
    <Wheel12
      labels={labels}
      centerLabel="Письменность"
      onSectorClick={(index) => onSelectScript(scriptOptions[index].code)}
    />
  );
}

export default function IshvaraPage() {
  const [activeNav, setActiveNav] = useState<string>(headerNav[0].key);
  const [activeFooterNav, setActiveFooterNav] = useState<string>(
    footerNav[0].key
  );

  const { language, setLanguage } = useLanguage();
  const [, setLocation] = useLocation();

  // Статус входа — используется, чтобы подписать кнопку "Ваша страница"
  // именем пользователя вместо статичного текста, и решить, куда вести
  // по клику: на /login (если не вошёл) или на выход (если уже вошёл).
  const { user, isAuthenticated, logout } = useAuth();

  // Санскрит — язык по умолчанию. Если хук useLanguage() ещё не
  // выставил ни один из известных 12 языков (например, при самом
  // первом заходе на сайт, когда в хранилище ничего не сохранено),
  // принудительно устанавливаем Санскрит один раз при монтировании.
  useEffect(() => {
    const knownCodes = languageOptions.map((l) => l.code);
    if (!language || !knownCodes.includes(language)) {
      setLanguage(DEFAULT_LANGUAGE as any);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ⚠️ ДОБАВЛЕНО: список игр и подписи колеса игр теперь зависят от
  // текущего языка интерфейса (см. getGamesForLanguage/FIRST_LETTER/
  // ALPHABET_LABEL выше) — при каждой смене language (через колесо
  // "Языки") сектор "Алфавит" колеса игр пересчитывается и показывает
  // букву и слово "алфавит" на новом выбранном языке.
  const games = useMemo(() => getGamesForLanguage(language), [language]);
  const gameWheelLabels = useMemo(() => getGameWheelLabels(games), [games]);

  // "main" — стартовое колесо (сектор 1 "Игры" активен и кликабелен,
  // сектора 2–7 — заглушки разделов, 8–12 — пустые),
  // "games" — колесо с 7 играми, открывается по клику на "Игры",
  // число (0–11) — вложенное колесо сектора (пока не используется),
  // "languages" — колесо выбора языка,
  // "scripts" — колесо выбора системы письменности,
  // "dictionary" — страница "Словарь используемых на сайте слов".
  const [view, setView] = useState<
    "main" | "games" | number | "languages" | "scripts" | "dictionary"
  >("main");

  // Кнопка "Меню" в футере (бывшая "Меню доступных языков") больше не
  // переключает состояние по кругу — вместо этого она открывает
  // выпадающий список с двумя разделами: "Языки" и "Системы
  // письменности". Пользователь сам выбирает, какое из двух колёс
  // открыть, каждый раз заново — без запоминания "стадии".
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Закрываем выпадающее меню при клике снаружи него.
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Клик по колесу категорий: сейчас работает только сектор 0
  // ("Игры") — открывает колесо с играми. Остальные подписанные
  // сектора (заглушки) физически некликабельны — см. clickableIndices
  // у Wheel12 в разметке ниже, — так что сюда их индексы никогда не
  // попадут, но проверка на index === 0 оставлена для ясности и на
  // случай будущего расширения списка кликабельных секторов.
  const handleSelectCategory = (index: number) => {
    if (index === 0) {
      setView("games");
    }
  };

  // Клик по сектору колеса игр — переход на страницу конкретной игры.
  const handleGameSectorClick = (index: number) => {
    const game = games[index];
    if (game) {
      setLocation(`/game?game=${game.type}`);
    }
  };

  const handleFooterClick = (key: string) => {
    setActiveFooterNav(key);
    if (key === "languages") {
      // Открываем/закрываем выпадающий список вместо прямого перехода
      // на одно из колёс.
      setIsMenuOpen((open) => !open);
    } else if (key === "site-page") {
      setIsMenuOpen(false);
      setView("dictionary");
    } else if (key === "all-data") {
      setIsMenuOpen(false);
      // Единая точка входа к платному доступу:
      // не вошёл — сначала форма входа/регистрации;
      // вошёл, но ещё не оплатил — колесо способов оплаты.
      // (Полная блокировка остальных страниц сайта для неоплативших —
      // отдельный шаг, ещё предстоит сделать компонент-«шлагбаум» в App.tsx.)
      if (!isAuthenticated) {
        setLocation("/login");
      } else {
        setLocation("/payments");
      }
    } else if (key === "your-page") {
      setIsMenuOpen(false);
      // Пока без действия — сюда позже добавится другое меню
      // (содержание уточним отдельно).
    }
  };

  // Выбор раздела в выпадающем меню кнопки "Меню".
  const handleSelectMenuOption = (option: "languages" | "scripts") => {
    setIsMenuOpen(false);
    setView(option);
  };

  const handleSelectLanguage = (code: string) => {
    setLanguage(code as any);
    setView("main");
  };

  const handleSelectScript = (_code: string) => {
    // Выбор письменности не хранится отдельно (пока не требуется) —
    // он только возвращает на главное колесо сайта.
    setView("main");
  };

  return (
    <div
      className="h-screen w-screen flex flex-col bg-white overflow-hidden"
      style={{ fontFamily: "ui-sans-serif, system-ui, sans-serif" }}
    >
      <header className="flex-shrink-0 w-full px-6 py-2 border-b border-yellow-200">
        <nav className="flex w-full gap-[0.5cm]">
          {headerNav.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveNav(item.key)}
              className="flex-1 px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
              style={{
                color: "#FFD700",
                borderColor: activeNav === item.key ? "#FFD700" : "#FFE066",
              }}
            >
              {item.label}
            </button>
          ))}
        </nav>
      </header>

      <main className="flex-1 min-h-0 flex flex-col items-center gap-2 py-2 overflow-hidden">
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

          {view === "languages" && (
            <LanguagesWheelView
              activeLanguage={language}
              onSelectLanguage={handleSelectLanguage}
            />
          )}

          {view === "scripts" && (
            <ScriptsWheelView onSelectScript={handleSelectScript} />
          )}

          {view === "dictionary" && (
            <Wheel12 labels={DICTIONARY_LABELS} centerLabel="Словарь" />
          )}
        </div>
      </main>

      <footer className="flex-shrink-0 w-full px-6 py-2 border-t border-yellow-200">
        <nav className="flex w-full gap-[0.5cm]">
          {footerNav.map((item) => {
            // Подпись кнопки "Доступ ко всем данным сайта" подменяется
            // динамически: приветствие с именем пользователя, если он
            // вошёл (и, значит, уже прошёл этап входа — дальше его
            // встретит колесо оплаты), иначе — приглашение войти.
            const label =
              item.key === "all-data"
                ? isAuthenticated
                  ? `Добро пожаловать, ${getWelcomeName(user)}!`
                  : "Начальная страница сайта"
                : item.label;

            const isMenuButton = item.key === "languages";

            return (
              <div
                key={item.key}
                className="flex-1 relative"
                ref={isMenuButton ? menuRef : undefined}
              >
                <button
                  onClick={() => handleFooterClick(item.key)}
                  className="w-full px-4 py-2 rounded-full border-2 font-bold text-base transition bg-white"
                  style={{
                    color: "#FFD700",
                    borderColor:
                      activeFooterNav === item.key ? "#FFD700" : "#FFE066",
                  }}
                >
                  {label}
                </button>

                {isMenuButton && isMenuOpen && (
                  <div
                    className="absolute bottom-full right-0 mb-2 w-56 rounded-2xl border-2 bg-white shadow-lg overflow-hidden z-10"
                    style={{ borderColor: "#FFD700" }}
                  >
                    <button
                      onClick={() => handleSelectMenuOption("languages")}
                      className="w-full px-4 py-3 text-left font-bold text-base transition hover:bg-yellow-50"
                      style={{ color: "#FFD700" }}
                    >
                      Языки
                    </button>
                    <div
                      className="h-px w-full"
                      style={{ backgroundColor: "#FFE066" }}
                    />
                    <button
                      onClick={() => handleSelectMenuOption("scripts")}
                      className="w-full px-4 py-3 text-left font-bold text-base transition hover:bg-yellow-50"
                      style={{ color: "#FFD700" }}
                    >
                      Системы письменности
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </nav>
      </footer>
    </div>
  );
}