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

// Гласные первого ряда таблицы — номера 1–14 (sort_order).
const isFirstRowVowel = (letter: LetterRow) =>
  hasType(letter, 'vowel', 'vowels') &&
  letter.sort_order != null &&
  letter.sort_order >= 1 &&
  letter.sort_order <= 14;

export const SAMKHYA_ITEMS: SamkhyaItem[] = [
    {
    id: 'varnas',
    label: { ru: "Varna's", uk: "Varna's", en: "Varna's" },
    // все буквы таблицы (1–50): гласные, ṃ, ḥ и согласные
    matches: () => true,
  },
  {
    id: 'sarva-ishvara',
    label: { ru: 'Сарвешвара', uk: 'Сарвешвара', en: 'Sarva-Ishvara' },
    matches: (letter) => hasType(letter, 'vowel', 'vowels'), // гласные
  },
  {
    id: 'vamana',
    label: { ru: 'Вамана', uk: 'Вамана', en: 'Vamana' },
    // первый ряд (гласные 1–14), нечётные номера: a, i, u, ṛ, ḷ, e, o
    matches: (letter) => isFirstRowVowel(letter) && (letter.sort_order as number) % 2 === 1,
  },
  {
    id: 'trivikrama',
    label: { ru: 'Тривикрама', uk: 'Трівікрама', en: 'Trivikrama' },
    // первый ряд (гласные 1–14), чётные номера: ā, ī, ū, ṝ, ḹ, ai, au
    matches: (letter) => isFirstRowVowel(letter) && (letter.sort_order as number) % 2 === 0,
  },
  {
    id: 'dash-avatars',
    label: { ru: 'Десять-аватар', uk: 'Десять-аватар', en: 'Dash-avatars' },
    // первые 10 гласных: a ā i ī u ū ṛ ṝ ḷ ḹ (sort_order 1–10)
    matches: (letter) =>
      hasType(letter, 'vowel', 'vowels') &&
      letter.sort_order != null &&
      letter.sort_order >= 1 &&
      letter.sort_order <= 10,
  },
    {
    id: 'ishvaras',
    label: { ru: "Ишвары", uk: "Iшвари", en: "Ishvara's" },
    // все гласные, кроме первых двух (a и ā): sort_order 3–14
    matches: (letter) =>
      hasType(letter, 'vowel', 'vowels') &&
      letter.sort_order != null &&
      letter.sort_order >= 3,
  },
    {
    id: 'ishas',
    label: { ru: "Isha's", uk: "Isha's", en: "Isha's" },
    // гласные первого ряда, кроме 1, 2 и 11–14: sort_order 3–10
    matches: (letter) =>
      isFirstRowVowel(letter) &&
      (letter.sort_order as number) >= 3 &&
      (letter.sort_order as number) <= 10,
  },
    {
    id: 'anantas',
    label: { ru: "Ananta's", uk: "Ananta's", en: "Ananta's" },
    // первые шесть букв первого ряда: a ā i ī u ū (sort_order 1–6)
    matches: (letter) =>
      isFirstRowVowel(letter) && (letter.sort_order as number) <= 6,
  },
    {
    id: 'chatukh-sans',
    label: { ru: 'Chatukh-sans', uk: 'Chatukh-sans', en: 'Chatukh-sans' },
    // кнопки 3–6 первого ряда: i ī u ū (sort_order 3–6)
    matches: (letter) =>
      isFirstRowVowel(letter) &&
      (letter.sort_order as number) >= 3 &&
      (letter.sort_order as number) <= 6,
  },
    {
    id: 'chatur-bhuji',
    label: { ru: 'Chatur-bhuji', uk: 'Chatur-bhuji', en: 'Chatur-bhuji' },
    // кнопки 5–8 первого ряда: u ū ṛ ṝ (sort_order 5–8)
    matches: (letter) =>
      isFirstRowVowel(letter) &&
      (letter.sort_order as number) >= 5 &&
      (letter.sort_order as number) <= 8,
  },
    {
    id: 'chatur-vyuha',
    label: { ru: 'Chatur-vyuha', uk: 'Chatur-vyuha', en: 'Chatur-vyuha' },
    // последние четыре кнопки первого ряда: e ai o au (sort_order 11–14)
    matches: (letter) =>
      isFirstRowVowel(letter) && (letter.sort_order as number) >= 11,
  },
    {
    id: 'vishnu-chakram',
    label: { ru: 'Вишну-чакрам', uk: 'Вiшну-чакрам', en: 'Vishnu-chakram' },
    // второй ряд таблицы: ṃ и ḥ (sort_order 15–16)
    matches: (letter) =>
      letter.sort_order != null &&
      letter.sort_order >= 15 &&
      letter.sort_order <= 16,
  },
];

// Раскладка букв санскрита на экране «Samkhya-prakaranam» (как в учебной
// таблице): гласные в один ряд, затем знаки, затем 5 вариг по 5 букв и
// «ступеньки» из 4, 3 и 2 букв. Ряды заданы диапазоном sort_order.
// cols — число колонок на узком экране (на широком кнопки идут в строку).
// Везде 14: кнопки на телефоне одного размера (как в ряду гласных) и вся
// таблица помещается на экран без прокрутки.
export interface SamkhyaRowSpec {
  from: number;
  to: number;
  cols: number;
  gapBefore?: boolean;
}

export const SAMKHYA_SA_ROWS: SamkhyaRowSpec[] = [
  { from: 1, to: 14, cols: 14 }, // гласные
  { from: 15, to: 16, cols: 14 }, // ṃ, ḥ
  { from: 17, to: 21, cols: 14, gapBefore: true }, // क ख ग घ ङ
  { from: 22, to: 26, cols: 14 }, // च छ ज झ ञ
  { from: 27, to: 31, cols: 14 }, // ट ठ ड ढ ण
  { from: 32, to: 36, cols: 14 }, // त थ द ध न
  { from: 37, to: 41, cols: 14 }, // प फ ब भ म
  { from: 42, to: 45, cols: 14, gapBefore: true }, // य र ल व
  { from: 46, to: 48, cols: 14 }, // श ष स
  { from: 49, to: 50, cols: 14 }, // ह ळ
];