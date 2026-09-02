import { useState, useEffect, useMemo, useRef } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { supabase } from "@/lib/supabase";

// ⚠️ ПОЛНАЯ ПЕРЕДЕЛКА: раньше этот компонент брал буквы из захардкоженных
// локальных файлов (@/lib/sanskritAlphabet, @/lib/cyrillicAlphabet) и
// поддерживал только 4 языка (sa, ru, uk, en) — для остальных 8 языков
// (ar, bn, id, es, pt, ur, fr, hi) в switch был default, откатывавший
// показ обратно на санскрит. Теперь буквы загружаются из Supabase
// (таблицы public.letter_writing_systems + public.letter_anchor) — так
// же, как это уже сделано в AlphabetPage.tsx, — и работают для любого
// из всех 12 языков сайта, при условии что для него заполнены строки
// в letter_anchor.
//
// ⚠️ В letter_anchor нет колонки с произношением/транслитерацией —
// только grapheme, letter_type, sort_order. Поэтому:
//   - группы букв ("Гласные"/"Согласные"/...) строятся ДИНАМИЧЕСКИ по
//     всем значениям letter_type, реально встретившимся у данного
//     языка (в порядке их первого появления по sort_order), а не по
//     фиксированному списку категорий, как было раньше для санскрита;
//   - всплывающая подсказка с произношением убрана — этих данных в
//     таблице просто нет. Озвучка по клику работает через
//     speechSynthesis (Web Speech API), как в AlphabetPage.tsx.
//
// ⚠️ Экран разделён на две части: слева — Functions/Categories/таблица
// букв, справа — поле для письма от руки (компонент DrawingPad ниже).
// Рисование — через Pointer Events (единый обработчик для мыши, пальца
// на сенсорном экране и стилуса).
//
// ⚠️ ПРАВКА ПО КОМПОНОВКЕ:
//   - Значки букв в таблице уменьшены (40×40px / text-sm), чтобы весь
//     алфавит помещался на экране без прокрутки.
//   - Панель "Categories" перенесена в левую колонку, под кнопку
//     "Audio" — одна колонка "Functions + Categories" слева от
//     таблицы.
//   - Поле для письма (DrawingPad) справа — узкое (фиксированная
//     ширина).
//   - Заголовок "Write the letter" и кнопка "Clear" перенесены ПОД
//     холст, чтобы верхний край холста был на одном уровне с верхним
//     краем левой части.
//   - Левая часть и правая часть (DrawingPad) выравнены по высоте —
//     общий flex-контейнер с align-items: stretch.
//
// ⚠️ ПРАВКА ПО ЦВЕТУ: палитра ограничена ровно четырьмя
// цветами — теми же, что использует колесо разделов на главной
// странице сайта (Wheel12 в IshvaraPage.tsx): чистое золото (100%),
// золото 67%, золото 33% и белый. Никакого серого/синего/зелёного/
// жёлтого (tailwind gray-*/blue-*/green-*/yellow-*) нигде не осталось —
// ни в фонах, ни в рамках, ни в тексте, ни в линии рисования, ни в
// водяном знаке буквы-трафарета. Различие состояний кнопок и ячеек
// (обычное / наведение / активное / выбранное) теперь передаётся
// исключительно комбинациями этих четырёх цветов и толщиной рамки —
// без введения дополнительных оттенков.
//
// ⚠️ ПРАВКА ПО ТОЛЩИНЕ РАМОК (эта версия): раньше рамка правого поля
// для письма (DrawingPad) была 2px, а рамки всех остальных элементов —
// кнопок Functions/Categories, контейнера таблицы букв и самих ячеек
// букв — были 1px, из-за чего правое поле визуально выделялось более
// толстой обводкой. Теперь ВСЕ рамки в компоненте — 2px, как у правого
// поля: кнопки Functions/Categories, контейнер таблицы букв, обычные и
// подсвеченные ячейки букв. Единственное сохранённое исключение —
// выбранная (кликнутая) буква: у неё рамка чуть толще (3px), чтобы
// текущий выбор оставался заметным на фоне остальных ячеек с
// одинаковой базовой толщиной рамки.

// Значения посчитаны той же формулой, что и sectorColor() в
// IshvaraPage.tsx: mix(goldPct) = GOLD*goldPct + WHITE*(1-goldPct),
// где GOLD = rgb(255,215,0), WHITE = rgb(255,255,255).
const GOLD_100 = '#FFD700'; // rgb(255,215,0)
const GOLD_67 = '#FFE454';  // rgb(255,228,84)
const GOLD_33 = '#FFF2AB';  // rgb(255,242,171)
const WHITE = '#FFFFFF';

// Единая толщина рамки для всех элементов интерфейса (кнопки, контейнер
// таблицы, ячейки букв, поле для письма) — подогнана под толщину рамки
// правого поля (DrawingPad), которая раньше была единственной 2px-рамкой
// в компоненте.
const BORDER_WIDTH = 2;
const BORDER_WIDTH_SELECTED = 3; // чуть толще — только для выбранной буквы

interface LetterRow {
  id: string;
  grapheme: string;
  letter_type: string | null;
  sort_order: number | null;
}

interface LetterGroup {
  type: string;
  letters: LetterRow[];
}

// Голосовой локаль для озвучки — свой для каждого из 12 языков сайта.
const SPEECH_LOCALE: Record<string, string> = {
  sa: 'hi-IN', // отдельного голоса для санскрита в браузерах обычно нет
  en: 'en-US',
  ar: 'ar-SA',
  bn: 'bn-IN',
  id: 'id-ID',
  es: 'es-ES',
  pt: 'pt-PT',
  ru: 'ru-RU',
  uk: 'uk-UA',
  ur: 'ur-PK',
  fr: 'fr-FR',
  hi: 'hi-IN',
};

// Подписи групп букв — переведены для языков интерфейса, где уже есть
// полный перевод (ru, uk, en); для остальных языков интерфейса, пока
// для них нет отдельного перевода UI (см. lib/i18n/translations.ts),
// используется английский вариант как запасной. Значения letter_type,
// которых нет в этом словаре, показываются как есть (с заглавной буквы).
const GROUP_LABELS: Record<string, Record<string, string>> = {
  vowel: { ru: 'Гласные', uk: 'Голосні', en: 'Vowels' },
  consonant: { ru: 'Согласные', uk: 'Приголосні', en: 'Consonants' },
  semivowel: { ru: 'Полугласные', uk: 'Напівголосні', en: 'Semivowels' },
  sibilant: { ru: 'Шипящие', uk: 'Шиплячі', en: 'Sibilants' },
  aspirate: { ru: 'Придыхательные', uk: 'Придихові', en: 'Aspirates' },
  guttural: { ru: 'Гортанные', uk: 'Горлові', en: 'Gutturals' },
  palatal: { ru: 'Нёбные', uk: 'Піднебінні', en: 'Palatals' },
  retroflex: { ru: 'Церебральные', uk: 'Церебральні', en: 'Retroflexes' },
  dental: { ru: 'Зубные', uk: 'Зубні', en: 'Dentals' },
  labial: { ru: 'Губные', uk: 'Губні', en: 'Labials' },
  numeral: { ru: 'Цифры', uk: 'Цифри', en: 'Numerals' },
  diacritic: { ru: 'Диакритика', uk: 'Діакритика', en: 'Diacritics' },
  special: { ru: 'Специальные знаки', uk: 'Спеціальні знаки', en: 'Special characters' },
  extra: { ru: 'Дополнительные', uk: 'Додаткові', en: 'Extra' },
};

function getGroupLabel(letterType: string, uiLanguage: string): string {
  const entry = GROUP_LABELS[letterType.toLowerCase()];
  if (entry) {
    return entry[uiLanguage] ?? entry.en;
  }
  // Неизвестный тип — показываем как есть, с заглавной буквы.
  return letterType.charAt(0).toUpperCase() + letterType.slice(1);
}

const FUNCTIONS_LABEL: Record<string, string> = { ru: 'Функции', uk: 'Функції', en: 'Functions' };
const AUDIO_LABEL: Record<string, string> = { ru: 'Озвучивание', uk: 'Озвучування', en: 'Audio' };
const CATEGORIES_LABEL: Record<string, string> = { ru: 'Категории', uk: 'Категорії', en: 'Categories' };
const LOADING_LABEL: Record<string, string> = { ru: 'Загрузка алфавита...', uk: 'Завантаження алфавіту...', en: 'Loading alphabet...' };
const NO_DATA_LABEL: Record<string, string> = {
  ru: 'Для данного языка пока нет букв в базе данных.',
  uk: 'Для цієї мови поки немає літер у базі даних.',
  en: 'No letters available for this language yet.',
};
const WRITE_LABEL: Record<string, string> = { ru: 'Напишите букву', uk: 'Напишіть літеру', en: 'Write the letter' };
const CLEAR_LABEL: Record<string, string> = { ru: 'Очистить', uk: 'Очистити', en: 'Clear' };
const PICK_LETTER_LABEL: Record<string, string> = {
  ru: 'Выберите букву слева, чтобы потренироваться её писать',
  uk: 'Виберіть літеру зліва, щоб потренуватися її писати',
  en: 'Pick a letter on the left to practice writing it',
};

function pickLabel(dict: Record<string, string>, uiLanguage: string): string {
  return dict[uiLanguage] ?? dict.en;
}

export function AlphabetTutor() {
  const { language } = useLanguage();

  const [letters, setLetters] = useState<LetterRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function fetchLetters() {
      setLoading(true);
      setActiveCategory(null);
      setSelectedId(null);
      try {
        const { data: systems, error: sysError } = await supabase
          .from('letter_writing_systems')
          .select('id')
          .eq('code', language);

        if (sysError) throw sysError;

        if (systems && systems.length > 0) {
          const systemId = systems[0].id;

          const { data: items, error: itemsError } = await supabase
            .from('letter_anchor')
            .select('*')
            .eq('language_id', systemId)
            .order('sort_order', { ascending: true });

          if (itemsError) throw itemsError;

          if (!cancelled) {
            setLetters(items || []);
          }
        } else if (!cancelled) {
          setLetters([]);
        }
      } catch (err) {
        console.error("Ошибка загрузки алфавита из базы данных:", err);
        if (!cancelled) setLetters([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchLetters();
    return () => {
      cancelled = true;
    };
  }, [language]);

  const groups: LetterGroup[] = useMemo(() => {
    const order: string[] = [];
    const byType = new Map<string, LetterRow[]>();
    for (const letter of letters) {
      const type = letter.letter_type || 'other';
      if (!byType.has(type)) {
        byType.set(type, []);
        order.push(type);
      }
      byType.get(type)!.push(letter);
    }
    return order.map((type) => ({ type, letters: byType.get(type)! }));
  }, [letters]);

  const selectedLetter = useMemo(
    () => letters.find((l) => l.id === selectedId) ?? null,
    [letters, selectedId]
  );

  const uiLanguage = ['ru', 'uk', 'en'].includes(language) ? language : 'en';

  function playLetter(grapheme: string) {
    if (!audioEnabled) return;
    try {
      const u = new SpeechSynthesisUtterance(grapheme);
      u.lang = SPEECH_LOCALE[language] ?? 'en-US';
      u.rate = 0.7;
      speechSynthesis.speak(u);
    } catch (e) {
      console.error(e);
    }
  }

  function handleLetterClick(letter: LetterRow) {
    setSelectedId(letter.id);
    playLetter(letter.grapheme);
  }

  function handleCategoryClick(type: string) {
    setActiveCategory((prev) => (prev === type ? null : type));
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <p className="text-sm font-bold" style={{ color: GOLD_100 }}>{pickLabel(LOADING_LABEL, uiLanguage)}</p>
      </div>
    );
  }

  if (letters.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <p className="text-sm font-bold" style={{ color: GOLD_100 }}>{pickLabel(NO_DATA_LABEL, uiLanguage)}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 h-full" style={{ backgroundColor: WHITE }}>
      <div className="flex gap-4 items-stretch h-full">
        {/* ЛЕВАЯ КОЛОНКА — Functions и Categories вместе. */}
        <div className="w-40 flex-shrink-0 space-y-4">
          <div>
            <h4 className="text-[10px] font-bold mb-1" style={{ color: GOLD_100 }}>
              {pickLabel(FUNCTIONS_LABEL, uiLanguage)}
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className="w-full text-left px-2 py-1 rounded text-xs font-bold transition-colors"
                style={
                  audioEnabled
                    ? { backgroundColor: GOLD_100, color: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
                    : { backgroundColor: WHITE, color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }
                }
                onMouseEnter={(e) => {
                  if (!audioEnabled) e.currentTarget.style.backgroundColor = GOLD_33;
                }}
                onMouseLeave={(e) => {
                  if (!audioEnabled) e.currentTarget.style.backgroundColor = WHITE;
                }}
              >
                🔊 {pickLabel(AUDIO_LABEL, uiLanguage)}
              </button>
            </div>
          </div>

          <div>
            <h4 className="text-[10px] font-bold mb-1" style={{ color: GOLD_100 }}>
              {pickLabel(CATEGORIES_LABEL, uiLanguage)}
            </h4>
            <div className="space-y-0.5">
              {groups.map((group) => {
                const isActive = activeCategory === group.type;
                return (
                  <button
                    key={group.type}
                    onClick={() => handleCategoryClick(group.type)}
                    className="w-full text-left px-2 py-1 rounded text-xs font-bold transition-colors"
                    style={
                      isActive
                        ? { backgroundColor: GOLD_67, color: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_67}` }
                        : { backgroundColor: WHITE, color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }
                    }
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = GOLD_33;
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.backgroundColor = WHITE;
                    }}
                  >
                    {getGroupLabel(group.type, uiLanguage)}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ЦЕНТР — таблица букв. */}
        <div className="flex-1 min-w-0 overflow-auto">
          <div
            className="p-3 rounded space-y-2"
            style={{ backgroundColor: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }}
          >
            {groups.map((group) => (
              <div key={group.type}>
                <h3 className="text-xs font-bold mb-1" style={{ color: GOLD_100 }}>
                  {getGroupLabel(group.type, uiLanguage)}
                </h3>
                <div className="flex gap-0.5 justify-start flex-wrap">
                  {group.letters.map((letter) => (
                    <LetterCard
                      key={letter.id}
                      letter={letter}
                      isHighlighted={activeCategory === group.type}
                      isSelected={selectedId === letter.id}
                      isHovered={hoveredId === letter.id}
                      onClick={() => handleLetterClick(letter)}
                      onMouseEnter={() => setHoveredId(letter.id)}
                      onMouseLeave={() => setHoveredId(null)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ ЧАСТЬ — поле для письма от руки. */}
        <div className="w-64 flex-shrink-0">
          <DrawingPad
            guideLetter={selectedLetter?.grapheme ?? null}
            uiLanguage={uiLanguage}
          />
        </div>
      </div>
    </div>
  );
}

interface LetterCardProps {
  letter: LetterRow;
  isHighlighted: boolean;
  isSelected: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function LetterCard({
  letter,
  isHighlighted,
  isSelected,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: LetterCardProps) {
  // Различие состояний передаётся только четырьмя разрешёнными цветами
  // (плюс толщина рамки), без введения синего/жёлтого/серого:
  //   - выбранная буква (клик) — инвертированные цвета: фон "золото
  //     100%", текст белый — самая заметная ячейка;
  //   - буква из активной категории — светлый золотой фон (33%) с
  //     более тёмной золотой рамкой (67%);
  //   - обычная ячейка — белый фон, тонкая светло-золотая рамка (33%),
  //     золотой (100%) текст буквы.
  //
  // Базовая толщина рамки для всех ячеек — BORDER_WIDTH (2px), как у
  // правого поля для письма. У выбранной буквы рамка чуть толще
  // (BORDER_WIDTH_SELECTED = 3px), чтобы текущий выбор было легко
  // отличить от остальных ячеек с одинаковой базовой толщиной.
  const background = isSelected ? GOLD_100 : isHighlighted ? GOLD_33 : WHITE;
  const textColor = isSelected ? WHITE : GOLD_100;
  const borderColor = isSelected ? GOLD_100 : isHighlighted ? GOLD_67 : GOLD_33;
  const borderWidth = isSelected ? BORDER_WIDTH_SELECTED : BORDER_WIDTH;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className="relative w-10 h-10 flex flex-col items-center justify-center transition-colors flex-shrink-0"
      style={{
        backgroundColor: background,
        border: `${borderWidth}px solid ${borderColor}`,
      }}
    >
      {letter.sort_order != null && (
        <div
          className="absolute top-0 right-0 text-[7px] font-bold px-0.5 leading-none"
          style={{ color: textColor }}
        >
          {letter.sort_order}
        </div>
      )}
      <div className="text-sm font-bold" style={{ color: textColor }}>
        {letter.grapheme}
      </div>
    </motion.button>
  );
}

// --- Поле для письма от руки ---
//
// Рисование через Pointer Events (onPointerDown/Move/Up/Leave) — один
// и тот же обработчик одинаково получает события и от мыши на
// ноутбуке, и от пальца на сенсорном телефоне/планшете, и от стилуса
// (например, Apple Pencil, S Pen) — браузер сам разруливает источник
// события, поэтому отдельно ловить touch-события не требуется.
//
// touch-action: none на canvas обязателен — без него при рисовании
// пальцем на сенсорном экране страница начнёт скроллиться/зумиться
// вместо того, чтобы рисовать линию.
//
// Цвет линии рисования и водяного знака буквы-трафарета — тоже из
// разрешённой палитры (золото 100% для линии, золото 33% сплошным
// цветом вместо полупрозрачного чёрного — для трафарета).
interface DrawingPadProps {
  guideLetter: string | null;
  uiLanguage: string;
}

function DrawingPad({ guideLetter, uiLanguage }: DrawingPadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    function setupCanvas() {
      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const rect = container.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;

      canvas.width = Math.max(1, Math.round(rect.width * dpr));
      canvas.height = Math.max(1, Math.round(rect.height * dpr));
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;

      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.scale(dpr, dpr);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = GOLD_100;
        ctx.lineWidth = 5;
      }
    }

    setupCanvas();
    window.addEventListener('resize', setupCanvas);
    return () => window.removeEventListener('resize', setupCanvas);
  }, []);

  useEffect(() => {
    clearCanvas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [guideLetter]);

  function clearCanvas() {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  }

  function getRelativePoint(e: React.PointerEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  function handlePointerDown(e: React.PointerEvent<HTMLCanvasElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDrawingRef.current = true;
    lastPointRef.current = getRelativePoint(e);
  }

  function handlePointerMove(e: React.PointerEvent<HTMLCanvasElement>) {
    if (!isDrawingRef.current) return;
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !lastPointRef.current) return;

    const point = getRelativePoint(e);
    ctx.beginPath();
    ctx.moveTo(lastPointRef.current.x, lastPointRef.current.y);
    ctx.lineTo(point.x, point.y);
    ctx.stroke();
    lastPointRef.current = point;
  }

  function handlePointerUp() {
    isDrawingRef.current = false;
    lastPointRef.current = null;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Холст первым — верхний край поля для письма выравнивается с
          верхним краем левой части (Functions/Categories/таблица). */}
      <div
        ref={containerRef}
        className="relative flex-1 rounded overflow-hidden"
        style={{ touchAction: 'none', minHeight: '260px', backgroundColor: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }}
      >
        {guideLetter ? (
          <div
            className="absolute inset-0 flex items-center justify-center pointer-events-none select-none"
            style={{ fontSize: 'min(30vw, 220px)', color: GOLD_33, fontWeight: 900 }}
          >
            {guideLetter}
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none px-4 text-center">
            <p className="text-xs font-bold" style={{ color: GOLD_67 }}>
              {pickLabel(PICK_LETTER_LABEL, uiLanguage)}
            </p>
          </div>
        )}

        <canvas
          ref={canvasRef}
          className="absolute inset-0"
          style={{ touchAction: 'none' }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
          onPointerCancel={handlePointerUp}
        />
      </div>

      <div className="flex items-center justify-between mt-1 flex-shrink-0">
        <h4 className="text-[10px] font-bold" style={{ color: GOLD_100 }}>
          {pickLabel(WRITE_LABEL, uiLanguage)}
        </h4>
        <button
          onClick={clearCanvas}
          className="px-2 py-1 rounded text-xs font-bold transition-colors"
          style={{ backgroundColor: WHITE, color: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = GOLD_33;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = WHITE;
          }}
        >
          {pickLabel(CLEAR_LABEL, uiLanguage)}
        </button>
      </div>
    </div>
  );
}