export interface SanskritLetter {
  devanagari: string;
  transliteration: string;
  pronunciation: string;
  audioFile?: string;
  category: string[];
}

// Vowels - 14 letters (first row on screenshot)
export const SANSKRIT_VOWELS: SanskritLetter[] = [
  {
    devanagari: 'अ',
    transliteration: 'a',
    pronunciation: 'Like "a" in "about"',
    audioFile: '1 (a) .mp3',
    category: ['vowels', 'short']
  },
  {
    devanagari: 'आ',
    transliteration: 'ā',
    pronunciation: 'Like "a" in "father"',
    audioFile: '2 (aa) .mp3',
    category: ['vowels', 'long']
  },
  {
    devanagari: 'इ',
    transliteration: 'i',
    pronunciation: 'Like "i" in "pin"',
    audioFile: '3 (i) .mp3',
    category: ['vowels', 'short']
  },
  {
    devanagari: 'ई',
    transliteration: 'ī',
    pronunciation: 'Like "ee" in "see"',
    audioFile: '4 (ii) .mp3',
    category: ['vowels', 'long']
  },
  {
    devanagari: 'उ',
    transliteration: 'u',
    pronunciation: 'Like "u" in "put" (not "up")',
    audioFile: '5 (u) .mp3',
    category: ['vowels', 'short']
  },
  {
    devanagari: 'ऊ',
    transliteration: 'ū',
    pronunciation: 'Like "oo" in "food"',
    audioFile: '6 (uu) .mp3',
    category: ['vowels', 'long']
  },
  {
    devanagari: 'ऋ',
    transliteration: 'ṛ',
    pronunciation: 'Syllabic "r" - curl tongue back',
    audioFile: '7 (ri) .mp3',
    category: ['vowels', 'short', 'syllabic']
  },
  {
    devanagari: 'ॠ',
    transliteration: 'ṝ',
    pronunciation: 'Long syllabic "r"',
    audioFile: '8 (rii) .mp3',
    category: ['vowels', 'long', 'syllabic']
  },
  {
    devanagari: 'ऌ',
    transliteration: 'ḷ',
    pronunciation: 'Syllabic "l"',
    audioFile: '9 (ḷ) .mp3',
    category: ['vowels', 'short', 'syllabic']
  },
  {
    devanagari: 'ए',
    transliteration: 'e',
    pronunciation: 'Like "ay" in "say"',
    audioFile: '10 (e) .mp3',
    category: ['vowels', 'diphthong']
  },
  {
    devanagari: 'ऐ',
    transliteration: 'ai',
    pronunciation: 'Like "ai" in "aisle"',
    audioFile: '11 (ai) .mp3',
    category: ['vowels', 'diphthong']
  },
  {
    devanagari: 'ओ',
    transliteration: 'o',
    pronunciation: 'Like "o" in "go"',
    audioFile: '12 (o) .mp3',
    category: ['vowels', 'diphthong']
  },
  {
    devanagari: 'औ',
    transliteration: 'au',
    pronunciation: 'Like "ow" in "cow"',
    audioFile: '13 (au) .mp3',
    category: ['vowels', 'diphthong']
  }
];

// Gutturals (Velar) - 5 letters
export const GUTTURALS: SanskritLetter[] = [
  {
    devanagari: 'क',
    transliteration: 'ka',
    pronunciation: 'Like "k" in "kite"',
    audioFile: '14 (ka) .mp3',
    category: ['consonants', 'gutturals', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'ख',
    transliteration: 'kha',
    pronunciation: 'Like "kh" with aspiration',
    audioFile: '15 (kha) .mp3',
    category: ['consonants', 'gutturals', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'ग',
    transliteration: 'ga',
    pronunciation: 'Like "g" in "go"',
    audioFile: '16 (ga) .mp3',
    category: ['consonants', 'gutturals', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'घ',
    transliteration: 'gha',
    pronunciation: 'Like "gh" with aspiration',
    audioFile: '17 (gha) .mp3',
    category: ['consonants', 'gutturals', 'voiced', 'aspirated']
  },
  {
    devanagari: 'ङ',
    transliteration: 'ṅa',
    pronunciation: 'Like "ng" in "sing"',
    audioFile: '18 (ṅa) .mp3',
    category: ['consonants', 'gutturals', 'nasal']
  }
];

// Palatals - 5 letters
export const PALATALS: SanskritLetter[] = [
  {
    devanagari: 'च',
    transliteration: 'ca',
    pronunciation: 'Like "ch" in "church"',
    audioFile: '19 (ca) .mp3',
    category: ['consonants', 'palatals', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'छ',
    transliteration: 'cha',
    pronunciation: 'Like "chh" with aspiration',
    audioFile: '20 (cha) .mp3',
    category: ['consonants', 'palatals', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'ज',
    transliteration: 'ja',
    pronunciation: 'Like "j" in "jump"',
    audioFile: '21 (ja) .mp3',
    category: ['consonants', 'palatals', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'झ',
    transliteration: 'jha',
    pronunciation: 'Like "jh" with aspiration',
    audioFile: '22 (jha) .mp3',
    category: ['consonants', 'palatals', 'voiced', 'aspirated']
  },
  {
    devanagari: 'ञ',
    transliteration: 'ña',
    pronunciation: 'Like "ny" in "canyon"',
    audioFile: '23 (ña) .mp3',
    category: ['consonants', 'palatals', 'nasal']
  }
];

// Retroflexes (Cerebrals) - 5 letters
export const RETROFLEXES: SanskritLetter[] = [
  {
    devanagari: 'ट',
    transliteration: 'ṭa',
    pronunciation: 'Retroflex "t" - curl tongue back',
    audioFile: '24 (ta) .mp3',
    category: ['consonants', 'retroflexes', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'ठ',
    transliteration: 'ṭha',
    pronunciation: 'Retroflex "th" with aspiration',
    audioFile: '25 (tha) .mp3',
    category: ['consonants', 'retroflexes', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'ड',
    transliteration: 'ḍa',
    pronunciation: 'Retroflex "d"',
    audioFile: '26 (da) .mp3',
    category: ['consonants', 'retroflexes', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'ढ',
    transliteration: 'ḍha',
    pronunciation: 'Retroflex "dh" with aspiration',
    audioFile: '27 (dha) .mp3',
    category: ['consonants', 'retroflexes', 'voiced', 'aspirated']
  },
  {
    devanagari: 'ण',
    transliteration: 'ṇa',
    pronunciation: 'Retroflex "n"',
    audioFile: '28 (ṇa) .mp3',
    category: ['consonants', 'retroflexes', 'nasal']
  }
];

// Dentals - 5 letters
export const DENTALS: SanskritLetter[] = [
  {
    devanagari: 'त',
    transliteration: 'ta',
    pronunciation: 'Like "t" in "top" (dental)',
    audioFile: '29 (ta) .mp3',
    category: ['consonants', 'dentals', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'थ',
    transliteration: 'tha',
    pronunciation: 'Like "th" with aspiration',
    audioFile: '30 (tha) .mp3',
    category: ['consonants', 'dentals', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'द',
    transliteration: 'da',
    pronunciation: 'Like "d" in "dog" (dental)',
    audioFile: '31 (da) .mp3',
    category: ['consonants', 'dentals', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'ध',
    transliteration: 'dha',
    pronunciation: 'Like "dh" with aspiration',
    audioFile: '32 (dha) .mp3',
    category: ['consonants', 'dentals', 'voiced', 'aspirated']
  },
  {
    devanagari: 'न',
    transliteration: 'na',
    pronunciation: 'Like "n" in "no" (dental)',
    audioFile: '33 (na) .mp3',
    category: ['consonants', 'dentals', 'nasal']
  }
];

// Labials - 5 letters
export const LABIALS: SanskritLetter[] = [
  {
    devanagari: 'प',
    transliteration: 'pa',
    pronunciation: 'Like "p" in "pot"',
    audioFile: '34 (pa) .mp3',
    category: ['consonants', 'labials', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'फ',
    transliteration: 'pha',
    pronunciation: 'Like "ph" with aspiration',
    audioFile: '35 (pha) .mp3',
    category: ['consonants', 'labials', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'ब',
    transliteration: 'ba',
    pronunciation: 'Like "b" in "bat"',
    audioFile: '36 (ba) .mp3',
    category: ['consonants', 'labials', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'भ',
    transliteration: 'bha',
    pronunciation: 'Like "bh" with aspiration',
    audioFile: '37 (bha) .mp3',
    category: ['consonants', 'labials', 'voiced', 'aspirated']
  },
  {
    devanagari: 'म',
    transliteration: 'ma',
    pronunciation: 'Like "m" in "mother"',
    audioFile: '38 (ma) .mp3',
    category: ['consonants', 'labials', 'nasal']
  }
];

// Semivowels - 4 letters
export const SEMIVOWELS: SanskritLetter[] = [
  {
    devanagari: 'य',
    transliteration: 'ya',
    pronunciation: 'Like "y" in "yes"',
    audioFile: '39 (ya) .mp3',
    category: ['consonants', 'semivowels']
  },
  {
    devanagari: 'र',
    transliteration: 'ra',
    pronunciation: 'Like "r" in "run"',
    audioFile: '40 (ra) .mp3',
    category: ['consonants', 'semivowels']
  },
  {
    devanagari: 'ल',
    transliteration: 'la',
    pronunciation: 'Like "l" in "love"',
    audioFile: '41 (la) .mp3',
    category: ['consonants', 'semivowels']
  },
  {
    devanagari: 'व',
    transliteration: 'va',
    pronunciation: 'Like "v" in "vine" or "w" in "wine"',
    audioFile: '42 (va) .mp3',
    category: ['consonants', 'semivowels']
  }
];

// Sibilants - 3 letters
export const SIBILANTS: SanskritLetter[] = [
  {
    devanagari: 'श',
    transliteration: 'śa',
    pronunciation: 'Like "sh" in "ship" (palatal)',
    audioFile: '43 (sa1) .mp3',
    category: ['consonants', 'sibilants']
  },
  {
    devanagari: 'ष',
    transliteration: 'ṣa',
    pronunciation: 'Like "sh" (retroflex)',
    audioFile: '44 (sa2) .mp3',
    category: ['consonants', 'sibilants']
  },
  {
    devanagari: 'स',
    transliteration: 'sa',
    pronunciation: 'Like "s" in "sun"',
    audioFile: '45 (sa3) .mp3',
    category: ['consonants', 'sibilants']
  }
];

// Aspirate - 1 letter
export const ASPIRATE: SanskritLetter[] = [
  {
    devanagari: 'ह',
    transliteration: 'ha',
    pronunciation: 'Like "h" in "house"',
    audioFile: '46 (ha) .mp3',
    category: ['consonants', 'aspirate']
  }
];

// Combined consonants array for backward compatibility
export const SANSKRIT_CONSONANTS: SanskritLetter[] = [
  ...GUTTURALS,
  ...PALATALS,
  ...RETROFLEXES,
  ...DENTALS,
  ...LABIALS,
  ...SEMIVOWELS,
  ...SIBILANTS,
  ...ASPIRATE
];

// Special characters - 4 letters (bottom row)
export const SANSKRIT_SPECIAL: SanskritLetter[] = [
  {
    devanagari: 'अं',
    transliteration: 'aṁ',
    pronunciation: 'Anusvara - nasal sound',
    audioFile: '47 (am) .mp3',
    category: ['special']
  },
  {
    devanagari: 'अः',
    transliteration: 'aḥ',
    pronunciation: 'Visarga - aspiration',
    audioFile: '48 (ah) .mp3',
    category: ['special']
  },
  {
    devanagari: 'क्ष',
    transliteration: 'kṣa',
    pronunciation: 'Compound: ka + ṣa',
    audioFile: '49 (ksa) .mp3',
    category: ['special', 'compound']
  },
  {
    devanagari: 'ज्ञ',
    transliteration: 'jña',
    pronunciation: 'Compound: ja + ña',
    audioFile: '50 (jna) .mp3',
    category: ['special', 'compound']
  }
];

export const ALPHABET_CATEGORIES = [
  { id: 'all-vowels', label: 'All Vowels', filter: ['vowels'], group: 'vowels' },
  { id: 'short-vowels', label: 'Short Vowels', filter: ['short'], group: 'vowels' },
  { id: 'long-vowels', label: 'Long Vowels', filter: ['long'], group: 'vowels' },
  { id: 'diphthongs', label: 'Diphthongs', filter: ['diphthong'], group: 'vowels' },
  { id: 'all-consonants', label: 'All Consonants', filter: ['consonants'], group: 'consonants' },
  { id: 'gutturals', label: 'Gutturals', filter: ['gutturals'], group: 'consonants' },
  { id: 'palatals', label: 'Palatals', filter: ['palatals'], group: 'consonants' },
  { id: 'retroflexes', label: 'Retroflex', filter: ['retroflexes'], group: 'consonants' },
  { id: 'dentals', label: 'Dentals', filter: ['dentals'], group: 'consonants' },
  { id: 'labials', label: 'Labials', filter: ['labials'], group: 'consonants' },
  { id: 'aspirated', label: 'Aspirated', filter: ['aspirated'], group: 'characteristics' },
  { id: 'unaspirated', label: 'Unaspirated', filter: ['unaspirated'], group: 'characteristics' },
  { id: 'voiced', label: 'Voiced', filter: ['voiced'], group: 'characteristics' },
  { id: 'unvoiced', label: 'Unvoiced', filter: ['unvoiced'], group: 'characteristics' }
];
