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
    audioFile: 'ru-a.mp3',
    category: ['vowels']
  },
  {
    character: 'Е',
    name: 'е',
    pronunciation: 'Like "ye" in "yes"',
    audioFile: 'ru-e.mp3',
    category: ['vowels']
  },
  {
    character: 'Ё',
    name: 'ё',
    pronunciation: 'Like "yo" in "yonder"',
    audioFile: 'ru-yo.mp3',
    category: ['vowels']
  },
  {
    character: 'И',
    name: 'и',
    pronunciation: 'Like "ee" in "see"',
    audioFile: 'ru-i.mp3',
    category: ['vowels']
  },
  {
    character: 'О',
    name: 'о',
    pronunciation: 'Like "o" in "more"',
    audioFile: 'ru-o.mp3',
    category: ['vowels']
  },
  {
    character: 'У',
    name: 'у',
    pronunciation: 'Like "oo" in "boot"',
    audioFile: 'ru-u.mp3',
    category: ['vowels']
  },
  {
    character: 'Ы',
    name: 'ы',
    pronunciation: 'Like "i" in "bit" (back of mouth)',
    audioFile: 'ru-y.mp3',
    category: ['vowels']
  },
  {
    character: 'Э',
    name: 'э',
    pronunciation: 'Like "e" in "met"',
    audioFile: 'ru-e2.mp3',
    category: ['vowels']
  },
  {
    character: 'Ю',
    name: 'ю',
    pronunciation: 'Like "yu" in "yule"',
    audioFile: 'ru-yu.mp3',
    category: ['vowels']
  },
  {
    character: 'Я',
    name: 'я',
    pronunciation: 'Like "ya" in "yard"',
    audioFile: 'ru-ya.mp3',
    category: ['vowels']
  }
];

export const RUSSIAN_CONSONANTS: Letter[] = [
  {
    character: 'Б',
    name: 'бэ',
    pronunciation: 'Like "b" in "bat"',
    audioFile: 'ru-b.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'В',
    name: 'вэ',
    pronunciation: 'Like "v" in "van"',
    audioFile: 'ru-v.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Г',
    name: 'гэ',
    pronunciation: 'Like "g" in "go"',
    audioFile: 'ru-g.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Д',
    name: 'дэ',
    pronunciation: 'Like "d" in "dog"',
    audioFile: 'ru-d.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Ж',
    name: 'жэ',
    pronunciation: 'Like "s" in "measure"',
    audioFile: 'ru-zh.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'З',
    name: 'зэ',
    pronunciation: 'Like "z" in "zoo"',
    audioFile: 'ru-z.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Й',
    name: 'и краткое',
    pronunciation: 'Like "y" in "yes"',
    audioFile: 'ru-j.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'К',
    name: 'ка',
    pronunciation: 'Like "k" in "kite"',
    audioFile: 'ru-k.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Л',
    name: 'эль',
    pronunciation: 'Like "l" in "love"',
    audioFile: 'ru-l.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'М',
    name: 'эм',
    pronunciation: 'Like "m" in "mother"',
    audioFile: 'ru-m.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Н',
    name: 'эн',
    pronunciation: 'Like "n" in "no"',
    audioFile: 'ru-n.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'П',
    name: 'пэ',
    pronunciation: 'Like "p" in "pot"',
    audioFile: 'ru-p.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Р',
    name: 'эр',
    pronunciation: 'Rolled "r"',
    audioFile: 'ru-r.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'С',
    name: 'эс',
    pronunciation: 'Like "s" in "sun"',
    audioFile: 'ru-s.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Т',
    name: 'тэ',
    pronunciation: 'Like "t" in "top"',
    audioFile: 'ru-t.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ф',
    name: 'эф',
    pronunciation: 'Like "f" in "fun"',
    audioFile: 'ru-f.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Х',
    name: 'ха',
    pronunciation: 'Like "ch" in Scottish "loch"',
    audioFile: 'ru-h.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ц',
    name: 'цэ',
    pronunciation: 'Like "ts" in "cats"',
    audioFile: 'ru-ts.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ч',
    name: 'че',
    pronunciation: 'Like "ch" in "church"',
    audioFile: 'ru-ch.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ш',
    name: 'ша',
    pronunciation: 'Like "sh" in "ship"',
    audioFile: 'ru-sh.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Щ',
    name: 'ща',
    pronunciation: 'Like "shch" (longer "sh")',
    audioFile: 'ru-shch.mp3',
    category: ['consonants', 'voiceless']
  }
];

export const RUSSIAN_SPECIAL: Letter[] = [
  {
    character: 'Ь',
    name: 'мягкий знак',
    pronunciation: 'Soft sign - softens preceding consonant',
    audioFile: 'ru-soft.mp3',
    category: ['special']
  },
  {
    character: 'Ъ',
    name: 'твёрдый знак',
    pronunciation: 'Hard sign - separates sounds',
    audioFile: 'ru-hard.mp3',
    category: ['special']
  }
];

// Ukrainian Alphabet
export const UKRAINIAN_VOWELS: Letter[] = [
  {
    character: 'А',
    name: 'а',
    pronunciation: 'Like "a" in "father"',
    audioFile: 'uk-a.mp3',
    category: ['vowels']
  },
  {
    character: 'Е',
    name: 'е',
    pronunciation: 'Like "e" in "met"',
    audioFile: 'uk-e.mp3',
    category: ['vowels']
  },
  {
    character: 'И',
    name: 'и',
    pronunciation: 'Like "i" in "bit"',
    audioFile: 'uk-y.mp3',
    category: ['vowels']
  },
  {
    character: 'І',
    name: 'і',
    pronunciation: 'Like "ee" in "see"',
    audioFile: 'uk-i.mp3',
    category: ['vowels']
  },
  {
    character: 'Ї',
    name: 'ї',
    pronunciation: 'Like "yi" in "yippee"',
    audioFile: 'uk-yi.mp3',
    category: ['vowels']
  },
  {
    character: 'О',
    name: 'о',
    pronunciation: 'Like "o" in "more"',
    audioFile: 'uk-o.mp3',
    category: ['vowels']
  },
  {
    character: 'У',
    name: 'у',
    pronunciation: 'Like "oo" in "boot"',
    audioFile: 'uk-u.mp3',
    category: ['vowels']
  },
  {
    character: 'Ю',
    name: 'ю',
    pronunciation: 'Like "yu" in "yule"',
    audioFile: 'uk-yu.mp3',
    category: ['vowels']
  },
  {
    character: 'Я',
    name: 'я',
    pronunciation: 'Like "ya" in "yard"',
    audioFile: 'uk-ya.mp3',
    category: ['vowels']
  }
];

export const UKRAINIAN_CONSONANTS: Letter[] = [
  {
    character: 'Б',
    name: 'бе',
    pronunciation: 'Like "b" in "bat"',
    audioFile: 'uk-b.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'В',
    name: 'ве',
    pronunciation: 'Like "v" in "van"',
    audioFile: 'uk-v.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Г',
    name: 'ге',
    pronunciation: 'Like "h" in "hat"',
    audioFile: 'uk-h.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Ґ',
    name: 'ґе',
    pronunciation: 'Like "g" in "go"',
    audioFile: 'uk-g.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Д',
    name: 'де',
    pronunciation: 'Like "d" in "dog"',
    audioFile: 'uk-d.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Ж',
    name: 'же',
    pronunciation: 'Like "s" in "measure"',
    audioFile: 'uk-zh.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'З',
    name: 'зе',
    pronunciation: 'Like "z" in "zoo"',
    audioFile: 'uk-z.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Й',
    name: 'йот',
    pronunciation: 'Like "y" in "yes"',
    audioFile: 'uk-j.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'К',
    name: 'ка',
    pronunciation: 'Like "k" in "kite"',
    audioFile: 'uk-k.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Л',
    name: 'ел',
    pronunciation: 'Like "l" in "love"',
    audioFile: 'uk-l.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'М',
    name: 'ем',
    pronunciation: 'Like "m" in "mother"',
    audioFile: 'uk-m.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'Н',
    name: 'ен',
    pronunciation: 'Like "n" in "no"',
    audioFile: 'uk-n.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'П',
    name: 'пе',
    pronunciation: 'Like "p" in "pot"',
    audioFile: 'uk-p.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Р',
    name: 'ер',
    pronunciation: 'Rolled "r"',
    audioFile: 'uk-r.mp3',
    category: ['consonants', 'voiced']
  },
  {
    character: 'С',
    name: 'ес',
    pronunciation: 'Like "s" in "sun"',
    audioFile: 'uk-s.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Т',
    name: 'те',
    pronunciation: 'Like "t" in "top"',
    audioFile: 'uk-t.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ф',
    name: 'еф',
    pronunciation: 'Like "f" in "fun"',
    audioFile: 'uk-f.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Х',
    name: 'ха',
    pronunciation: 'Like "ch" in Scottish "loch"',
    audioFile: 'uk-kh.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ц',
    name: 'це',
    pronunciation: 'Like "ts" in "cats"',
    audioFile: 'uk-ts.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ч',
    name: 'че',
    pronunciation: 'Like "ch" in "church"',
    audioFile: 'uk-ch.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Ш',
    name: 'ша',
    pronunciation: 'Like "sh" in "ship"',
    audioFile: 'uk-sh.mp3',
    category: ['consonants', 'voiceless']
  },
  {
    character: 'Щ',
    name: 'ща',
    pronunciation: 'Like "shch"',
    audioFile: 'uk-shch.mp3',
    category: ['consonants', 'voiceless']
  }
];

export const UKRAINIAN_SPECIAL: Letter[] = [
  {
    character: 'Ь',
    name: "м'який знак",
    pronunciation: 'Soft sign - softens preceding consonant',
    audioFile: 'uk-soft.mp3',
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
  { id: 'all-vowels', label: 'All Vowels', filter: ['vowels'] },
  { id: 'all-consonants', label: 'All Consonants', filter: ['consonants'] },
  { id: 'voiced', label: 'Voiced', filter: ['voiced'] },
  { id: 'voiceless', label: 'Voiceless', filter: ['voiceless'] },
  { id: 'special', label: 'Special', filter: ['special'] }
];

export const ENGLISH_CATEGORIES = [
  { id: 'all-vowels', label: 'Vowels', filter: ['vowels'] },
  { id: 'all-consonants', label: 'Consonants', filter: ['consonants'] },
  { id: 'voiced', label: 'Voiced', filter: ['voiced'] },
  { id: 'voiceless', label: 'Voiceless', filter: ['voiceless'] }
];
