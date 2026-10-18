import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLanguage } from '@/lib/i18n';
import { useLanguageScript } from '@/lib/languageScript';
import { BORDER_WIDTH, GOLD_100, GOLD_33, GOLD_67, SILVER, WHITE } from '../alphabet-tutor/constants';
import { useAlphabetLetters } from '../alphabet-tutor/hooks';
import { getGroupLabel, L, pickLabel } from '../alphabet-tutor/labels';
import { LetterCard } from '../alphabet-tutor/LetterCard';
import type { LetterGroup } from '../alphabet-tutor/types';
import { CALC_ERROR_TEXT, evaluate } from './engine';
import { useScriptLetterMap } from './useScriptLetterMap';

// «Калькулятор» — режим игры №12. От обычного калькулятора отличается
// тремя разделами клавиатуры: «Числа», «Знаки» и «Буквы» (символы
// выбранного языка/письменности, как в игре «Алфавит»; язык и письменность
// выбираются вверху экрана, в шапке).
//
// Раздел «Буквы»: нажатие на букву вставляет её в строку ввода в выбранной
// письменности — так можно написать, например, «косинус» словом. Слова-
// названия функций движок узнаёт по таблице functionNames.ts.
//
// Результаты сеанса хранятся только в памяти страницы; сохранение на
// дискету (в файл) пока заглушка, см. GameHeader/game.tsx.

type Section = 'numbers' | 'signs' | 'letters';
type KeyKind = 'digit' | 'op' | 'sign' | 'fn' | 'letter';

interface CalcKey {
  label: string;
  insert: string;
  kind: KeyKind;
}

const k = (label: string, kind: KeyKind, insert = label): CalcKey => ({ label, insert, kind });

// Панели — сетка 5 × 3; null — пустая клетка.
const NUMBER_KEYS: (CalcKey | null)[] = [
  k('1', 'digit'), k('2', 'digit'), k('3', 'digit'), k('4', 'digit'), k('5', 'digit'),
  k('6', 'digit'), k('7', 'digit'), k('8', 'digit'), k('9', 'digit'), k('0', 'digit'),
  k(',', 'digit'), null, null, null, null,
];

const SIGN_KEYS: (CalcKey | null)[] = [
  k('+', 'op'), k('−', 'op'), k('×', 'op'), k('÷', 'op'), null,
  k('(', 'sign'), k(')', 'sign'), k('°', 'sign'), k('′', 'sign'), k('″', 'sign'),
  k('sin', 'fn', 'sin '), k('cos', 'fn', 'cos '), k('tan', 'fn', 'tan '), k('cot', 'fn', 'cot '), null,
];

const SECTION_TABS: { id: Section; label: string }[] = [
  { id: 'numbers', label: 'Числа' },
  { id: 'signs', label: 'Знаки' },
  { id: 'letters', label: 'Буквы' },
];

interface HistoryItem {
  expr: string;
  result: string;
}

// Высота панели клавиш одинакова во всех трёх разделах, чтобы строка
// управления внизу не прыгала при переключении вкладок.
const PANEL_HEIGHT = 'h-[196px] sm:h-[216px]';

const KEY_COMMON = 'rounded-xl font-bold text-black transition-transform active:scale-95 select-none';
const KEY_BASE = `h-10 sm:h-12 text-base ${KEY_COMMON}`;
const PANEL_KEY_BASE = `h-full text-xl ${KEY_COMMON}`;

function keyClass(kind: KeyKind): string {
  if (kind === 'digit') return `${PANEL_KEY_BASE} bg-white border-2 border-[#FFD700] hover:bg-yellow-50`;
  if (kind === 'fn') return `${PANEL_KEY_BASE} bg-[#FFE454] hover:bg-[#FFD700] !text-base`;
  return `${PANEL_KEY_BASE} bg-[#FFD700] hover:bg-[#E6C200]`;
}

// Стирание последнего символа с учётом составных знаков письма
// (например, «क्ष» или буква с огласовкой стирается целиком).
function dropLastGrapheme(text: string): string {
  const Segmenter = (Intl as unknown as { Segmenter?: new (l?: string, o?: object) => { segment(s: string): Iterable<{ segment: string }> } }).Segmenter;
  const parts = Segmenter
    ? Array.from(new Segmenter(undefined, { granularity: 'grapheme' }).segment(text), (p) => p.segment)
    : Array.from(text);
  parts.pop();
  return parts.join('');
}

export function Calculator() {
  const { language } = useLanguage();
  const { script, languageLabel, scriptLabel } = useLanguageScript();
  const uiLanguage = ['ru', 'uk', 'en'].includes(language) ? language : 'en';

  const [section, setSection] = useState<Section>('numbers');
  const [expr, setExpr] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [justEvaluated, setJustEvaluated] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const exprRef = useRef<HTMLDivElement>(null);

  // Строка ввода всегда прокручена к её концу.
  useEffect(() => {
    const el = exprRef.current;
    if (el) el.scrollLeft = el.scrollWidth;
  }, [expr]);

  const press = useCallback(
    (insert: string, kind: KeyKind) => {
      setError('');
      if (justEvaluated) {
        // После «=» оператор продолжает вычисление с результата,
        // всё остальное начинает новое выражение.
        setExpr(kind === 'op' && result ? result + insert : insert);
        setJustEvaluated(false);
      } else {
        setExpr((prev) => prev + insert);
      }
      setResult(null);
    },
    [justEvaluated, result]
  );

  const backspace = useCallback(() => {
    setError('');
    setResult(null);
    setJustEvaluated(false);
    // Название функции стирается целиком («cos » → ничего).
    setExpr((prev) =>
      /(?:sin|cos|tan|cot) $/.test(prev)
        ? prev.replace(/(?:sin|cos|tan|cot) $/, '')
        : dropLastGrapheme(prev)
    );
  }, []);

  const clearAll = useCallback(() => {
    setExpr('');
    setResult(null);
    setError('');
    setJustEvaluated(false);
  }, []);

  // Пробел нужен, чтобы отделять слова-названия функций друг от друга.
  const addSpace = useCallback(() => {
    if (justEvaluated) return;
    setError('');
    setExpr((prev) => (prev === '' || prev.endsWith(' ') ? prev : prev + ' '));
  }, [justEvaluated]);

  const equals = useCallback(() => {
    if (justEvaluated) return;
    const r = evaluate(expr);
    if (r.ok) {
      setResult(r.text);
      setError('');
      setJustEvaluated(true);
      setHistory((h) => [{ expr, result: r.text }, ...h].slice(0, 100));
    } else if (r.error !== 'empty') {
      setError(CALC_ERROR_TEXT[r.error]);
    }
  }, [expr, justEvaluated]);

  // Клавиатура компьютера (удобно на десктопе): цифры, + − * / ( ),
  // Enter, Backspace, Escape. На телефоне экранная клавиатура не нужна.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
      const key = e.key;
      if (/^[0-9]$/.test(key)) press(key, 'digit');
      else if (key === ',' || key === '.') press(',', 'digit');
      else if (key === '+') press('+', 'op');
      else if (key === '-') press('−', 'op');
      else if (key === '*') press('×', 'op');
      else if (key === '/') press('÷', 'op');
      else if (key === '(' || key === ')') press(key, 'sign');
      else if (key === 'Enter' || key === '=') equals();
      else if (key === 'Backspace') backspace();
      else if (key === 'Escape') clearAll();
      else return;
      e.preventDefault();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [press, equals, backspace, clearAll]);

  const renderKey = (key: CalcKey | null, i: number) =>
    key ? (
      <button
        key={`${key.label}-${i}`}
        type="button"
        onClick={() => press(key.insert, key.kind)}
        className={keyClass(key.kind)}
      >
        {key.label}
      </button>
    ) : (
      <div key={`blank-${i}`} aria-hidden="true" />
    );

  return (
    <div className="max-w-md mx-auto w-full flex flex-col gap-1.5 font-montserrat">
      {/* Дисплей */}
      <div
        className="rounded-xl bg-white px-3 py-1.5"
        style={{ border: `${BORDER_WIDTH}px solid ${GOLD_100}` }}
      >
        <div
          ref={exprRef}
          className="text-right text-xl sm:text-2xl font-bold text-black whitespace-nowrap overflow-x-auto leading-tight min-h-[1.5rem]"
          aria-label="Выражение"
        >
          {expr || <span style={{ color: SILVER }}>0</span>}
        </div>
        <div className="text-right text-sm font-bold leading-tight min-h-[1.25rem]" aria-live="polite">
          {error ? (
            <span className="text-red-600">{error}</span>
          ) : result !== null ? (
            <span style={{ color: '#8B6B00' }}>= {result}</span>
          ) : null}
        </div>
      </div>

      {/* Результаты сеанса */}
      <div className="rounded-xl px-2 py-1" style={{ backgroundColor: GOLD_33 }}>
        <div className="text-[10px] font-bold leading-tight" style={{ color: '#8B6B00' }}>
          Результаты сеанса · не сохраняются (дискета пока не активна)
        </div>
        <ul className="h-[54px] overflow-y-auto text-xs font-bold text-black">
          {history.length === 0 ? (
            <li className="pt-1" style={{ color: SILVER }}>
              Здесь появятся ваши подсчёты
            </li>
          ) : (
            history.map((h, i) => (
              <li key={`${history.length - i}`} className="flex justify-between gap-2 leading-snug">
                <span className="truncate">{h.expr}</span>
                <span className="flex-shrink-0">= {h.result}</span>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Разделы клавиатуры */}
      <div className="flex gap-1">
        {SECTION_TABS.map((tab) => {
          const active = section === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSection(tab.id)}
              className="flex-1 px-2 py-1 rounded-full text-sm font-bold transition-colors"
              style={
                active
                  ? { backgroundColor: GOLD_100, color: '#000', border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
                  : { backgroundColor: WHITE, color: SILVER, border: `${BORDER_WIDTH}px solid ${GOLD_67}` }
              }
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {section === 'letters' ? (
        <LettersPanel
          language={language}
          script={script}
          uiLanguage={uiLanguage}
          title={`${languageLabel} · ${scriptLabel}`}
          onInsert={(text) => press(text, 'letter')}
          onSpace={addSpace}
        />
      ) : (
        <div className={`grid grid-cols-5 grid-rows-3 gap-1 ${PANEL_HEIGHT}`}>
          {(section === 'numbers' ? NUMBER_KEYS : SIGN_KEYS).map(renderKey)}
        </div>
      )}

      {/* Управление — всегда на виду */}
      <div className="grid grid-cols-3 gap-1">
        <button
          type="button"
          onClick={clearAll}
          className={`${KEY_BASE} bg-white border-2 border-amber-300 hover:bg-yellow-50`}
          aria-label="Очистить всё"
        >
          C
        </button>
        <button
          type="button"
          onClick={backspace}
          className={`${KEY_BASE} bg-white border-2 border-amber-300 hover:bg-yellow-50`}
          aria-label="Стереть последний символ"
        >
          ⌫
        </button>
        <button
          type="button"
          onClick={equals}
          className={`${KEY_BASE} bg-amber-300 hover:bg-amber-400 text-white`}
          aria-label="Вычислить"
        >
          =
        </button>
      </div>
    </div>
  );
}

// Раздел «Буквы»: буквы выбранного языка — тем же видом, что в игре
// «Алфавит». На кнопке и в строке ввода — написание буквы в выбранной
// письменности (если для неё такого написания нет — обычное написание).
function LettersPanel({
  language,
  script,
  uiLanguage,
  title,
  onInsert,
  onSpace,
}: {
  language: string;
  script: string;
  uiLanguage: string;
  title: string;
  onInsert: (text: string) => void;
  onSpace: () => void;
}) {
  const { letters, loading } = useAlphabetLetters(language);
  const { map: scriptMap, loading: scriptLoading } = useScriptLetterMap(
    useMemo(() => letters.map((l) => l.id), [letters]),
    script
  );

  const groups: LetterGroup[] = useMemo(() => {
    const byType = new Map<string, LetterGroup>();
    for (const letter of letters) {
      const type = letter.letter_type || 'other';
      if (!byType.has(type)) byType.set(type, { type, letters: [] });
      // grapheme заменяем на написание в выбранной письменности.
      byType
        .get(type)!
        .letters.push({ ...letter, grapheme: scriptMap.get(letter.id) ?? letter.grapheme });
    }
    return [...byType.values()];
  }, [letters, scriptMap]);

  const busy = loading || scriptLoading;

  return (
    <div
      className={`${PANEL_HEIGHT} flex flex-col rounded-xl bg-white p-1`}
      style={{ border: `${BORDER_WIDTH}px solid ${GOLD_33}` }}
    >
      <div className="flex items-center justify-between gap-2 mb-1 flex-shrink-0">
        <p className="text-[10px] font-bold leading-tight truncate" style={{ color: '#8B6B00' }}>
          {title}
        </p>
        <button
          type="button"
          onClick={onSpace}
          className="flex-shrink-0 px-2 py-0.5 rounded-lg bg-[#FFD700] hover:bg-[#E6C200] text-black text-xs font-bold active:scale-95"
          aria-label="Пробел"
        >
          ␣ пробел
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {busy ? (
          <p className="text-xs font-bold" style={{ color: SILVER }}>
            {pickLabel(L.loading, uiLanguage)}
          </p>
        ) : letters.length === 0 ? (
          <p className="text-xs font-bold" style={{ color: SILVER }}>
            {pickLabel(L.noData, uiLanguage)}
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.type} className="mb-1">
              <h3 className="text-[10px] font-bold leading-none mb-0.5" style={{ color: SILVER }}>
                {getGroupLabel(group.type, uiLanguage)}
              </h3>
              <div className="grid grid-cols-11 gap-0.5">
                {group.letters.map((letter) => (
                  <LetterCard
                    key={letter.id}
                    letter={letter}
                    isHighlighted={false}
                    isSelected={false}
                    onClick={() => onInsert(letter.grapheme)}
                  />
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
