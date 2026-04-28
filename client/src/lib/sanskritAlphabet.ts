export interface SanskritLetter {
  devanagari: string;
  transliteration: string;
  pronunciation: string;
  audioFile?: string;
  category: string[];
}

export const SANSKRIT_VOWELS: SanskritLetter[] = [
  {
    devanagari: 'अ',
    transliteration: 'a',
    pronunciation: 'Like "a" in "about"',
    audioFile: 'a.mp3',
    category: ['vowels', 'short']
  },
  {
    devanagari: 'आ',
    transliteration: 'ā',
    pronunciation: 'Like "a" in "father"',
    audioFile: 'aa.mp3',
    category: ['vowels', 'long']
  },
  {
    devanagari: 'इ',
    transliteration: 'i',
    pronunciation: 'Like "i" in "pin"',
    audioFile: 'i.mp3',
    category: ['vowels', 'short']
  },
  {
    devanagari: 'ई',
    transliteration: 'ī',
    pronunciation: 'Like "ee" in "see"',
    audioFile: 'ii.mp3',
    category: ['vowels', 'long']
  },
  {
    devanagari: 'उ',
    transliteration: 'u',
    pronunciation: 'Like "u" in "put" (not "up")',
    audioFile: 'u.mp3',
    category: ['vowels', 'short']
  },
  {
    devanagari: 'ऊ',
    transliteration: 'ū',
    pronunciation: 'Like "oo" in "food"',
    audioFile: 'uu.mp3',
    category: ['vowels', 'long']
  },
  {
    devanagari: 'ऋ',
    transliteration: 'ṛ',
    pronunciation: 'Syllabic "r" - curl tongue back',
    audioFile: 'ri.mp3',
    category: ['vowels', 'short', 'syllabic']
  },
  {
    devanagari: 'ॠ',
    transliteration: 'ṝ',
    pronunciation: 'Long syllabic "r"',
    audioFile: 'rii.mp3',
    category: ['vowels', 'long', 'syllabic']
  },
  {
    devanagari: 'ऌ',
    transliteration: 'ḷ',
    pronunciation: 'Syllabic "l"',
    audioFile: 'li.mp3',
    category: ['vowels', 'short', 'syllabic']
  },
  {
    devanagari: 'ए',
    transliteration: 'e',
    pronunciation: 'Like "ay" in "say"',
    audioFile: 'e.mp3',
    category: ['vowels', 'diphthong']
  },
  {
    devanagari: 'ऐ',
    transliteration: 'ai',
    pronunciation: 'Like "ai" in "aisle"',
    audioFile: 'ai.mp3',
    category: ['vowels', 'diphthong']
  },
  {
    devanagari: 'ओ',
    transliteration: 'o',
    pronunciation: 'Like "o" in "go"',
    audioFile: 'o.mp3',
    category: ['vowels', 'diphthong']
  },
  {
    devanagari: 'औ',
    transliteration: 'au',
    pronunciation: 'Like "ow" in "cow"',
    audioFile: 'au.mp3',
    category: ['vowels', 'diphthong']
  }
];

export const SANSKRIT_CONSONANTS: SanskritLetter[] = [
  // Gutturals (Velar)
  {
    devanagari: 'क',
    transliteration: 'ka',
    pronunciation: 'Like "k" in "kite"',
    audioFile: 'ka.mp3',
    category: ['consonants', 'gutturals', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'ख',
    transliteration: 'kha',
    pronunciation: 'Like "kh" with aspiration',
    audioFile: 'kha.mp3',
    category: ['consonants', 'gutturals', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'ग',
    transliteration: 'ga',
    pronunciation: 'Like "g" in "go"',
    audioFile: 'ga.mp3',
    category: ['consonants', 'gutturals', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'घ',
    transliteration: 'gha',
    pronunciation: 'Like "gh" with aspiration',
    audioFile: 'gha.mp3',
    category: ['consonants', 'gutturals', 'voiced', 'aspirated']
  },
  {
    devanagari: 'ङ',
    transliteration: 'ṅa',
    pronunciation: 'Like "ng" in "sing"',
    audioFile: 'nga.mp3',
    category: ['consonants', 'gutturals', 'nasal']
  },
  // Palatals
  {
    devanagari: 'च',
    transliteration: 'ca',
    pronunciation: 'Like "ch" in "church"',
    audioFile: 'ca.mp3',
    category: ['consonants', 'palatals', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'छ',
    transliteration: 'cha',
    pronunciation: 'Like "chh" with aspiration',
    audioFile: 'cha.mp3',
    category: ['consonants', 'palatals', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'ज',
    transliteration: 'ja',
    pronunciation: 'Like "j" in "jump"',
    audioFile: 'ja.mp3',
    category: ['consonants', 'palatals', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'झ',
    transliteration: 'jha',
    pronunciation: 'Like "jh" with aspiration',
    audioFile: 'jha.mp3',
    category: ['consonants', 'palatals', 'voiced', 'aspirated']
  },
  {
    devanagari: 'ञ',
    transliteration: 'ña',
    pronunciation: 'Like "ny" in "canyon"',
    audioFile: 'nya.mp3',
    category: ['consonants', 'palatals', 'nasal']
  },
  // Retroflexes (Cerebrals)
  {
    devanagari: 'ट',
    transliteration: 'ṭa',
    pronunciation: 'Retroflex "t" - curl tongue back',
    audioFile: 'ta-retro.mp3',
    category: ['consonants', 'retroflexes', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'ठ',
    transliteration: 'ṭha',
    pronunciation: 'Retroflex "th" with aspiration',
    audioFile: 'tha-retro.mp3',
    category: ['consonants', 'retroflexes', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'ड',
    transliteration: 'ḍa',
    pronunciation: 'Retroflex "d"',
    audioFile: 'da-retro.mp3',
    category: ['consonants', 'retroflexes', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'ढ',
    transliteration: 'ḍha',
    pronunciation: 'Retroflex "dh" with aspiration',
    audioFile: 'dha-retro.mp3',
    category: ['consonants', 'retroflexes', 'voiced', 'aspirated']
  },
  {
    devanagari: 'ण',
    transliteration: 'ṇa',
    pronunciation: 'Retroflex "n"',
    audioFile: 'na-retro.mp3',
    category: ['consonants', 'retroflexes', 'nasal']
  },
  // Dentals
  {
    devanagari: 'त',
    transliteration: 'ta',
    pronunciation: 'Like "t" in "top" (dental)',
    audioFile: 'ta.mp3',
    category: ['consonants', 'dentals', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'थ',
    transliteration: 'tha',
    pronunciation: 'Like "th" with aspiration',
    audioFile: 'tha.mp3',
    category: ['consonants', 'dentals', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'द',
    transliteration: 'da',
    pronunciation: 'Like "d" in "dog" (dental)',
    audioFile: 'da.mp3',
    category: ['consonants', 'dentals', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'ध',
    transliteration: 'dha',
    pronunciation: 'Like "dh" with aspiration',
    audioFile: 'dha.mp3',
    category: ['consonants', 'dentals', 'voiced', 'aspirated']
  },
  {
    devanagari: 'न',
    transliteration: 'na',
    pronunciation: 'Like "n" in "no" (dental)',
    audioFile: 'na.mp3',
    category: ['consonants', 'dentals', 'nasal']
  },
  // Labials
  {
    devanagari: 'प',
    transliteration: 'pa',
    pronunciation: 'Like "p" in "pot"',
    audioFile: 'pa.mp3',
    category: ['consonants', 'labials', 'unvoiced', 'unaspirated']
  },
  {
    devanagari: 'फ',
    transliteration: 'pha',
    pronunciation: 'Like "ph" with aspiration',
    audioFile: 'pha.mp3',
    category: ['consonants', 'labials', 'unvoiced', 'aspirated']
  },
  {
    devanagari: 'ब',
    transliteration: 'ba',
    pronunciation: 'Like "b" in "bat"',
    audioFile: 'ba.mp3',
    category: ['consonants', 'labials', 'voiced', 'unaspirated']
  },
  {
    devanagari: 'भ',
    transliteration: 'bha',
    pronunciation: 'Like "bh" with aspiration',
    audioFile: 'bha.mp3',
    category: ['consonants', 'labials', 'voiced', 'aspirated']
  },
  {
    devanagari: 'म',
    transliteration: 'ma',
    pronunciation: 'Like "m" in "mother"',
    audioFile: 'ma.mp3',
    category: ['consonants', 'labials', 'nasal']
  },
  // Semivowels
  {
    devanagari: 'य',
    transliteration: 'ya',
    pronunciation: 'Like "y" in "yes"',
    audioFile: 'ya.mp3',
    category: ['consonants', 'semivowels']
  },
  {
    devanagari: 'र',
    transliteration: 'ra',
    pronunciation: 'Like "r" in "run"',
    audioFile: 'ra.mp3',
    category: ['consonants', 'semivowels']
  },
  {
    devanagari: 'ल',
    transliteration: 'la',
    pronunciation: 'Like "l" in "love"',
    audioFile: 'la.mp3',
    category: ['consonants', 'semivowels']
  },
  {
    devanagari: 'व',
    transliteration: 'va',
    pronunciation: 'Like "v" in "vine" or "w" in "wine"',
    audioFile: 'va.mp3',
    category: ['consonants', 'semivowels']
  },
  // Sibilants
  {
    devanagari: 'श',
    transliteration: 'śa',
    pronunciation: 'Like "sh" in "ship" (palatal)',
    audioFile: 'sha-palatal.mp3',
    category: ['consonants', 'sibilants']
  },
  {
    devanagari: 'ष',
    transliteration: 'ṣa',
    pronunciation: 'Like "sh" (retroflex)',
    audioFile: 'sha-retro.mp3',
    category: ['consonants', 'sibilants']
  },
  {
    devanagari: 'स',
    transliteration: 'sa',
    pronunciation: 'Like "s" in "sun"',
    audioFile: 'sa.mp3',
    category: ['consonants', 'sibilants']
  },
  // Aspirate
  {
    devanagari: 'ह',
    transliteration: 'ha',
    pronunciation: 'Like "h" in "house"',
    audioFile: 'ha.mp3',
    category: ['consonants', 'aspirate']
  }
];

export const SANSKRIT_SPECIAL: SanskritLetter[] = [
  {
    devanagari: 'अं',
    transliteration: 'ṃ',
    pronunciation: 'Anusvara - nasal sound',
    audioFile: 'anusvara.mp3',
    category: ['special']
  },
  {
    devanagari: 'अः',
    transliteration: 'ḥ',
    pronunciation: 'Visarga - aspiration',
    audioFile: 'visarga.mp3',
    category: ['special']
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
