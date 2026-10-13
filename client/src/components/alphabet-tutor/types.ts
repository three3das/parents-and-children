export interface LetterRow {
  id: string;
  grapheme: string;
  letter_type: string | null;
  sort_order: number | null;
}

export interface LetterGroup {
  type: string;
  letters: LetterRow[];
}

// Слово из /api/words: word — русское слово, translatedWord — перевод
// на язык из параметра lang (если он есть).
export interface DictionaryWord {
  id: string;
  word: string;
  translatedWord?: string;
}