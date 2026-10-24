import type { LetterRow } from './types';

// Кнопки раздела «Samkhya-prakaranam». Каждая выделяет в таблице свой набор
// букв (по правилу matches). Новые кнопки добавляются сюда — в AlphabetTutor.tsx
// ничего менять не нужно.
export interface SamkhyaItem {
  id: string;
  label: Record<string, string>;
  matches: (letter: LetterRow) => boolean;
}

const hasType = (letter: LetterRow, ...types: string[]) =>
  types.includes((letter.letter_type ?? '').toLowerCase());

export const SAMKHYA_ITEMS: SamkhyaItem[] = [
  {
    id: 'sarveshvara',
    label: { ru: 'Сарвешвара', uk: 'Сарвешвара', en: 'Sarveshvara' },
    matches: (letter) => hasType(letter, 'vowel', 'vowels'), // гласные
  },
];

// Раскладка букв санскрита на экране «Samkhya-prakaranam» (как в учебной
// таблице): гласные в один ряд, затем знаки, затем 5 вариг по 5 букв и
// «ступеньки» из 4, 3 и 2 букв. Ряды заданы диапазоном sort_order.
// cols — число колонок на узком экране (на широком кнопки идут в строку).
export interface SamkhyaRowSpec {
  from: number;
  to: number;
  cols: number;
  gapBefore?: boolean;
}

export const SAMKHYA_SA_ROWS: SamkhyaRowSpec[] = [
  { from: 1, to: 14, cols: 14 }, // гласные
  { from: 15, to: 16, cols: 14 }, // ṃ, ḥ
  { from: 17, to: 21, cols: 5, gapBefore: true }, // क ख ग घ ङ
  { from: 22, to: 26, cols: 5 }, // च छ ज झ ञ
  { from: 27, to: 31, cols: 5 }, // ट ठ ड ढ ण
  { from: 32, to: 36, cols: 5 }, // त थ द ध न
  { from: 37, to: 41, cols: 5 }, // प फ ब भ म
  { from: 42, to: 45, cols: 5, gapBefore: true }, // य र ल व
  { from: 46, to: 48, cols: 5 }, // श ष स
  { from: 49, to: 50, cols: 5 }, // ह ळ
];