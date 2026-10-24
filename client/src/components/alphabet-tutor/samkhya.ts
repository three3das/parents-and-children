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