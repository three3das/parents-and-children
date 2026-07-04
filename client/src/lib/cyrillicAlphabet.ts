export interface Letter {
  character: string;
  name: string;
  pronunciation: string;
  audioFile?: string;
  category: string[];
}

// Russian Alphabet
export const RUSSIAN_VOWELS: Letter[] = [
  {
    character: 'А',
    name: 'а',
    pronunciation: 'Like "a" in "father"',
    audioFile: 'А.mp3',
    category: ['vowels']
  },
  {
    character: 'Е',
    name: 'е',
    pronunciation: 'Like "ye" in "yes"',
    audioFile: 'Е.mp3',
    category: ['vowels']
  },
  {
    character: 'Ё',
    name: 'ё',
    pronunciation: 'Like "yo" in "yonder"',
    audioFile: 'Ё.mp3',
    category: ['vowels']
  },
  {
    character: 'И',
    name: 'и',
    pronunciation: 'Like "ee" in "see"',
    audioFile: 'И.mp3',
    category: ['vowels']
  },
  {
    character: 'О',
    name: 'о',
    pronunciation: 'Like "o" in "more"',
    audioFile: 'О.mp3',
    category: ['vowels']
  },
  {
    character: 'У',
    name: 'у',
    pronunciation: 'Like "oo" in "boot"',
    audioFile: 'У.mp3',
    category: ['vowels']
  },
  {
    character: 'Ы',
    name: 'ы',
    pronunciation: 'Like "i" in "bit" (back of mouth)',
    audioFile: 'Ы.mp3',
    category: ['vowels']
  },
  {
    character: 'Э',
    name: 'э',
    pronunciation: 'Like "e" in "met"',
    audioFile: 'Э.mp3',
    category: ['vowels']
  },
  {
    character: 'Ю',
    name: 'ю',
    pronunciation: 'Like "yu" in "yule"',
    audioFile: 'Ю.mp3',
    category: ['vowels']
  },
  {
    character: 'Я',
    name: 'я',
    pronunciation: 'Like "ya" in "yard"',
    audioFile: 'Я.mp3',
    category: ['vowels']
  }
];

export const RUSSIAN_CONSONANTS: Letter[] = [
  {
    character: 'Б',
    name: 'бэ',
    pronunciation: 'Like "b" in "bat"',
    audioFile: 'Б.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'В',
    name: 'вэ',
    pronunciation: 'Like "v" in "van"',
    audioFile: 'В.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Г',
    name: 'гэ',
    pronunciation: 'Like "g" in "go"',
    audioFile: 'Г.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Д',
    name: 'дэ',
    pronunciation: 'Like "d" in "dog"',
    audioFile: 'Д.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Ж',
    name: 'жэ',
    pronunciation: 'Like "s" in "measure"',
    audioFile: 'Ж.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'З',
    name: 'зэ',
    pronunciation: 'Like "z" in "zoo"',
    audioFile: 'З.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Й',
    name: 'и краткое',
    pronunciation: 'Like "y" in "yes"',
    audioFile: 'Й.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'К',
    name: 'ка',
    pronunciation: 'Like "k" in "kite"',
    audioFile: 'К.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Л',
    name: 'эль',
    pronunciation: 'Like "l" in "love"',
    audioFile: 'Л.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'М',
    name: 'эм',
    pronunciation: 'Like "m" in "mother"',
    audioFile: 'М.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Н',
    name: 'эн',
    pronunciation: 'Like "n" in "no"',
    audioFile: 'Н.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'П',
    name: 'пэ',
    pronunciation: 'Like "p" in "pot"',
    audioFile: 'П.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Р',
    name: 'эр',
    pronunciation: 'Rolled "r"',
    audioFile: 'Р.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'С',
    name: 'эс',
    pronunciation: 'Like "s" in "sun"',
    audioFile: 'С.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Т',
    name: 'тэ',
    pronunciation: 'Like "t" in "top"',
    audioFile: 'Т.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ф',
    name: 'эф',
    pronunciation: 'Like "f" in "fun"',
    audioFile: 'Ф.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Х',
    name: 'ха',
    pronunciation: 'Like "ch" in Scottish "loch"',
    audioFile: 'Х.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ц',
    name: 'цэ',
    pronunciation: 'Like "ts" in "cats"',
    audioFile: 'Ц.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ч',
    name: 'че',
    pronunciation: 'Like "ch" in "church"',
    audioFile: 'Ч.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ш',
    name: 'ша',
    pronunciation: 'Like "sh" in "ship"',
    audioFile: 'Ш.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Щ',
    name: 'ща',
    pronunciation: 'Like "shch" (longer "sh")',
    audioFile: 'Щ.mp3',
    category: ['consonants', 'voiceless']
  }
];

export const RUSSIAN_SPECIAL: Letter[] = [
  {
    character: 'Ь',
    name: 'мягкий знак',
    pronunciation: 'Soft sign - softens preceding consonant',
    audioFile: 'Ь.mp3',
    category: ['special']
  },
  {
    character: 'Ъ',
    name: 'твёрдый знак',
    pronunciation: 'Hard sign - separates sounds',
    audioFile: 'Ъ.mp3',
    category: ['special']
  }
];

// Ukrainian Alphabet
export const UKRAINIAN_VOWELS: Letter[] = [
  {
    character: 'А',
    name: 'а',
    pronunciation: 'Like "a" in "father"',
    audioFile: 'А.mp3',
    category: ['vowels']
  },
  {
    character: 'Е',
    name: 'е',
    pronunciation: 'Like "e" in "met"',
    audioFile: 'Е.mp3',
    category: ['vowels']
  },
  {
    character: 'И',
    name: 'и',
    pronunciation: 'Like "i" in "bit"',
    audioFile: 'И.mp3',
    category: ['vowels']
  },
  {
    character: 'І',
    name: 'і',
    pronunciation: 'Like "ee" in "see"',
    audioFile: 'І.mp3',
    category: ['vowels']
  },
  {
    character: 'Ї',
    name: 'ї',
    pronunciation: 'Like "yi" in "yippee"',
    audioFile: 'Ї.mp3',
    category: ['vowels']
  },
  {
    character: 'О',
    name: 'о',
    pronunciation: 'Like "o" in "more"',
    audioFile: 'О.mp3',
    category: ['vowels']
  },
  {
    character: 'У',
    name: 'у',
    pronunciation: 'Like "oo" in "boot"',
    audioFile: 'У.mp3',
    category: ['vowels']
  },
  {
    character: 'Ю',
    name: 'ю',
    pronunciation: 'Like "yu" in "yule"',
    audioFile: 'Ю.mp3',
    category: ['vowels']
  },
  {
    character: 'Я',
    name: 'я',
    pronunciation: 'Like "ya" in "yard"',
    audioFile: 'Я.mp3',
    category: ['vowels']
  }
];

export const UKRAINIAN_CONSONANTS: Letter[] = [
  {
    character: 'Б',
    name: 'бе',
    pronunciation: 'Like "b" in "bat"',
    audioFile: 'Б.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'В',
    name: 'ве',
    pronunciation: 'Like "v" in "van"',
    audioFile: 'В.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Г',
    name: 'ге',
    pronunciation: 'Like "h" in "hat"',
    audioFile: 'Г.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Ґ',
    name: 'ґе',
    pronunciation: 'Like "g" in "go"',
    audioFile: 'Ґ.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Д',
    name: 'де',
    pronunciation: 'Like "d" in "dog"',
    audioFile: 'Д.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Ж',
    name: 'же',
    pronunciation: 'Like "s" in "measure"',
    audioFile: 'Ж.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'З',
    name: 'зе',
    pronunciation: 'Like "z" in "zoo"',
    audioFile: 'З.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Й',
    name: 'йот',
    pronunciation: 'Like "y" in "yes"',
    audioFile: 'Й.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'К',
    name: 'ка',
    pronunciation: 'Like "k" in "kite"',
    audioFile: 'К.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Л',
    name: 'ел',
    pronunciation: 'Like "l" in "love"',
    audioFile: 'Л.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'М',
    name: 'ем',
    pronunciation: 'Like "m" in "mother"',
    audioFile: 'М.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Н',
    name: 'ен',
    pronunciation: 'Like "n" in "no"',
    audioFile: 'Н.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'П',
    name: 'пе',
    pronunciation: 'Like "p" in "pot"',
    audioFile: 'П.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Р',
    name: 'ер',
    pronunciation: 'Rolled "r"',
    audioFile: 'Р.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'С',
    name: 'ес',
    pronunciation: 'Like "s" in "sun"',
    audioFile: 'С.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Т',
    name: 'те',
    pronunciation: 'Like "t" in "top"',
    audioFile: 'Т.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ф',
    name: 'еф',
    pronunciation: 'Like "f" in "fun"',
    audioFile: 'Ф.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Х',
    name: 'ха',
    pronunciation: 'Like "ch" in Scottish "loch"',
    audioFile: 'Х.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ц',
    name: 'це',
    pronunciation: 'Like "ts" in "cats"',
    audioFile: 'Ц.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ч',
    name: 'че',
    pronunciation: 'Like "ch" in "church"',
    audioFile: 'Ч.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ш',
    name: 'ша',
    pronunciation: 'Like "sh" in "ship"',
    audioFile: 'Ш.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Щ',
    name: 'ща',
    pronunciation: 'Like "shch"',
    audioFile: 'Щ.mp3',
    category: ['consonants', 'voiceless']
  }
];

export const UKRAINIAN_SPECIAL: Letter[] = [
  {
    character: 'Ь',
    name: "м'який знак",
    pronunciation: 'Soft sign - softens preceding consonant',
    audioFile: 'Ь.mp3',
    category: ['special']
  }
];

// English Alphabet
export const ENGLISH_VOWELS: Letter[] = [
  {
    character: 'A',
    name: 'a',
    pronunciation: 'Like "ay" in "say"',
    audioFile: 'en-a.mp3',
    category: ['vowels']
  },
  {
    character: 'E',
    name: 'e',
    pronunciation: 'Like "ee" in "see"',
    audioFile: 'en-e.mp3',
    category: ['vowels']
  },
  {
    character: 'I',
    name: 'i',
    pronunciation: 'Like "eye"',
    audioFile: 'en-i.mp3',
    category: ['vowels']
  },
  {
    character: 'O',
    name: 'o',
    pronunciation: 'Like "oh"',
    audioFile: 'en-o.mp3',
    category: ['vowels']
  },
  {
    character: 'U',
    name: 'u',
    pronunciation: 'Like "you"',
    audioFile: 'en-u.mp3',
    category: ['vowels']
  }
];

export const ENGLISH_CONSONANTS: Letter[] = [
  {
    character: 'B',
    name: 'b',
    pronunciation: 'Like "b" in "bat"',
    audioFile: 'en-b.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'C',
    name: 'c',
    pronunciation: 'Like "k" or "s"',
    audioFile: 'en-c.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'D',
    name: 'd',
    pronunciation: 'Like "d" in "dog"',
    audioFile: 'en-d.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'F',
    name: 'f',
    pronunciation: 'Like "f" in "fun"',
    audioFile: 'en-f.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'G',
    name: 'g',
    pronunciation: 'Like "g" in "go"',
    audioFile: 'en-g.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'H',
    name: 'h',
    pronunciation: 'Like "h" in "hat"',
    audioFile: 'en-h.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'J',
    name: 'j',
    pronunciation: 'Like "j" in "jump"',
    audioFile: 'en-j.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'K',
    name: 'k',
    pronunciation: 'Like "k" in "kite"',
    audioFile: 'en-k.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'L',
    name: 'l',
    pronunciation: 'Like "l" in "love"',
    audioFile: 'en-l.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'M',
    name: 'm',
    pronunciation: 'Like "m" in "mother"',
    audioFile: 'en-m.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'N',
    name: 'n',
    pronunciation: 'Like "n" in "no"',
    audioFile: 'en-n.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'P',
    name: 'p',
    pronunciation: 'Like "p" in "pot"',
    audioFile: 'en-p.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Q',
    name: 'q',
    pronunciation: 'Like "kw"',
    audioFile: 'en-q.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'R',
    name: 'r',
    pronunciation: 'Like "r" in "run"',
    audioFile: 'en-r.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'S',
    name: 's',
    pronunciation: 'Like "s" in "sun"',
    audioFile: 'en-s.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'T',
    name: 't',
    pronunciation: 'Like "t" in "top"',
    audioFile: 'en-t.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'V',
    name: 'v',
    pronunciation: 'Like "v" in "van"',
    audioFile: 'en-v.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'W',
    name: 'w',
    pronunciation: 'Like "w" in "win"',
    audioFile: 'en-w.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'X',
    name: 'x',
    pronunciation: 'Like "ks"',
    audioFile: 'en-x.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Y',
    name: 'y',
    pronunciation: 'Like "y" in "yes"',
    audioFile: 'en-y.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Z',
    name: 'z',
    pronunciation: 'Like "z" in "zoo"',
    audioFile: 'en-z.mp3',
    category: ['consonants', 'voiced']
  }
];

export const CYRILLIC_CATEGORIES = [
  { id: 'all-vowels', label: 'Гласные', filter: ['vowels'] },
  { id: 'all-consonants', label: 'Согласные', filter: ['consonants'] },
  { id: 'voiced', label: 'Звонкие', filter: ['voiced'] },
  { id: 'voiceless', label: 'Глухие', filter: ['voiceless'] },
  { id: 'special', label: 'Специальные', filter: ['special'] }
];

export const ENGLISH_CATEGORIES = [
  { id: 'all-vowels', label: 'Vowels', filter: ['vowels'] },
  { id: 'all-consonants', label: 'Consonants', filter: ['consonants'] },
  { id: 'voiced', label: 'Voiced', filter: ['voiced'] },
  { id: 'voiceless', label: 'Voiceless', filter: ['voiceless'] }
];
