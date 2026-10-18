// Движок калькулятора: разбор и вычисление выражений без eval.
//
// Что умеет:
//   • числа (десятичный разделитель «,» или «.»), + − × ÷, скобки,
//     унарный минус;
//   • углы в градусах, минутах и секундах: 30°30′30″ (также 45°, 10′, 20″
//     по отдельности, 30°30′, 30°30″). Значение угла — число градусов;
//   • функции sin, cos, tan, cot — аргумент ВСЕГДА в градусах, поэтому
//     «cos 30» означает cos 30°. Названия можно писать словами на любом
//     языке из functionNames.ts (синус, косинус, seno, جا …) — так их
//     набирает раздел «Буквы».
//
// Функция без скобок берёт следующий «множитель»: число с ° ′ ″ или
// выражение в скобках: «cos 30°30′30″ + 1» = cos(30°30′30″) + 1.

import { FN_ALIASES, type FnName } from './functionNames';

export type CalcErrorCode = 'empty' | 'syntax' | 'div0' | 'undefined';

export type CalcResult =
  | { ok: true; value: number; text: string }
  | { ok: false; error: CalcErrorCode };

export const CALC_ERROR_TEXT: Record<CalcErrorCode, string> = {
  empty: '',
  syntax: 'Ошибка в записи',
  div0: 'На ноль делить нельзя',
  undefined: 'Не определено',
};

class CalcError extends Error {
  constructor(public code: CalcErrorCode) {
    super(code);
  }
}

type Tok =
  | { t: 'num'; v: number }
  | { t: 'op'; v: '+' | '-' | '*' | '/' }
  | { t: 'lp' }
  | { t: 'rp' }
  | { t: 'unit'; v: 'deg' | 'min' | 'sec' }
  | { t: 'fn'; v: FnName };

// Приводит «клавиатурные» варианты знаков к основным.
function normalize(src: string): string {
  return src
    .replace(/[−–—]/g, '-')
    .replace(/[×·*]/g, '*')
    .replace(/[÷:]/g, '/')
    .replace(/[º˚]/g, '°')
    .replace(/['’′`]/g, '′')
    .replace(/["”″]/g, '″')
    .replace(/,/g, '.');
}

// Любая буква любой письменности (включая знаки гласных деванагари и т. п.).
const LETTER = /[\p{L}\p{M}]/u;

function tokenize(src: string): Tok[] {
  const s = normalize(src).toLowerCase();
  const out: Tok[] = [];
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    if (c === ' ' || c === '\u00a0') {
      i++;
    } else if ((c >= '0' && c <= '9') || c === '.') {
      let j = i;
      let dots = 0;
      while (j < s.length && ((s[j] >= '0' && s[j] <= '9') || s[j] === '.')) {
        if (s[j] === '.') dots++;
        j++;
      }
      const raw = s.slice(i, j);
      if (dots > 1 || raw === '.') throw new CalcError('syntax');
      out.push({ t: 'num', v: parseFloat(raw) });
      i = j;
    } else if (c === '+' || c === '-' || c === '*' || c === '/') {
      out.push({ t: 'op', v: c });
      i++;
    } else if (c === '(') {
      out.push({ t: 'lp' });
      i++;
    } else if (c === ')') {
      out.push({ t: 'rp' });
      i++;
    } else if (c === '°') {
      out.push({ t: 'unit', v: 'deg' });
      i++;
    } else if (c === '′') {
      out.push({ t: 'unit', v: 'min' });
      i++;
    } else if (c === '″') {
      out.push({ t: 'unit', v: 'sec' });
      i++;
    } else if (LETTER.test(c)) {
      let j = i;
      while (j < s.length && LETTER.test(s[j])) j++;
      const fn = FN_ALIASES[s.slice(i, j)];
      if (!fn) throw new CalcError('syntax');
      out.push({ t: 'fn', v: fn });
      i = j;
    } else {
      throw new CalcError('syntax');
    }
  }
  return out;
}

const UNIT_RANK = { deg: 0, min: 1, sec: 2 } as const;
const UNIT_DIVISOR = { deg: 1, min: 60, sec: 3600 } as const;

// Тригонометрия в градусах с «чисткой» погрешности: sin 30° = 0.5 точно,
// cos 90° = 0, а tan 90° и cot 0° — «не определено».
function applyFn(fn: FnName, deg: number): number {
  const EPS = 1e-9;
  const mod = (x: number, m: number) => ((x % m) + m) % m;
  if (fn === 'tan' && Math.abs(mod(deg, 180) - 90) < EPS) throw new CalcError('undefined');
  if (fn === 'cot') {
    const r = mod(deg, 180);
    if (r < EPS || 180 - r < EPS) throw new CalcError('undefined');
  }
  const rad = (deg * Math.PI) / 180;
  let r: number;
  if (fn === 'sin') r = Math.sin(rad);
  else if (fn === 'cos') r = Math.cos(rad);
  else if (fn === 'tan') r = Math.tan(rad);
  else r = 1 / Math.tan(rad);
  if (Math.abs(r) < 1e-12) return 0;
  return Number(r.toPrecision(12));
}

class Parser {
  private pos = 0;
  constructor(private toks: Tok[]) {}

  private peek(): Tok | undefined {
    return this.toks[this.pos];
  }

  parseAll(): number {
    const v = this.expr();
    if (this.pos < this.toks.length) throw new CalcError('syntax');
    return v;
  }

  // expr := term (('+'|'-') term)*
  private expr(): number {
    let v = this.term();
    for (;;) {
      const t = this.peek();
      if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
        this.pos++;
        const r = this.term();
        v = t.v === '+' ? v + r : v - r;
      } else return v;
    }
  }

  // term := unary (('*'|'/') unary)*
  private term(): number {
    let v = this.unary();
    for (;;) {
      const t = this.peek();
      if (t && t.t === 'op' && (t.v === '*' || t.v === '/')) {
        this.pos++;
        const r = this.unary();
        if (t.v === '/') {
          if (r === 0) throw new CalcError('div0');
          v = v / r;
        } else v = v * r;
      } else return v;
    }
  }

  // unary := ('+'|'-') unary | primary
  private unary(): number {
    const t = this.peek();
    if (t && t.t === 'op' && (t.v === '+' || t.v === '-')) {
      this.pos++;
      const v = this.unary();
      return t.v === '-' ? -v : v;
    }
    return this.primary();
  }

  // primary := fn unary | '(' expr ')' | angle
  private primary(): number {
    const t = this.peek();
    if (!t) throw new CalcError('syntax');
    if (t.t === 'fn') {
      this.pos++;
      const arg = this.unary();
      return applyFn(t.v, arg);
    }
    if (t.t === 'lp') {
      this.pos++;
      const v = this.expr();
      const close = this.peek();
      if (!close || close.t !== 'rp') throw new CalcError('syntax');
      this.pos++;
      // «cos(30+15)°» — знак градуса после скобки допустим (значение
      // и так в градусах).
      const deg = this.peek();
      if (deg && deg.t === 'unit' && deg.v === 'deg') this.pos++;
      return v;
    }
    if (t.t === 'num') return this.angleOrNumber();
    throw new CalcError('syntax');
  }

  // number [° [number ′ [number ″]]] — и частичные формы (10′, 20″, 30°30″).
  private angleOrNumber(): number {
    const first = this.peek() as { t: 'num'; v: number };
    this.pos++;
    let u = this.peek();
    if (!u || u.t !== 'unit') return first.v;

    let total = first.v / UNIT_DIVISOR[u.v];
    let rank = UNIT_RANK[u.v];
    this.pos++;

    for (;;) {
      const n = this.toks[this.pos];
      const un = this.toks[this.pos + 1];
      if (n && n.t === 'num' && un && un.t === 'unit' && UNIT_RANK[un.v] > rank) {
        total += n.v / UNIT_DIVISOR[un.v];
        rank = UNIT_RANK[un.v];
        this.pos += 2;
      } else break;
    }
    return total;
  }
}

// Число → строка: до 10 значащих цифр, десятичная запятая.
export function formatNumber(x: number): string {
  if (Object.is(x, -0)) x = 0;
  const s = Number(x.toPrecision(10)).toString();
  return s.replace('.', ',');
}

export function evaluate(src: string): CalcResult {
  if (src.trim() === '') return { ok: false, error: 'empty' };
  try {
    const value = new Parser(tokenize(src)).parseAll();
    if (!Number.isFinite(value)) return { ok: false, error: 'undefined' };
    return { ok: true, value, text: formatNumber(value) };
  } catch (e) {
    if (e instanceof CalcError) return { ok: false, error: e.code };
    return { ok: false, error: 'syntax' };
  }
}
