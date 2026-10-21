import { speak } from './speech';

// ═════════════════════════════════════════════════════════════════════════
// Озвучивание букв готовыми mp3 из public/audio/letters/<папка>/.
// Если для языка источника нет, файла нет или он не загрузился — буква
// читается синтезом речи браузера (как раньше).
//
// КАК ДОБАВИТЬ НОВУЮ ЗВУКОВУЮ ГРУППУ
//   1. Положите mp3 в public/audio/letters/<папка>/.
//   2. Добавьте одну строку в LETTER_AUDIO_SOURCES ниже (ключ — код языка
//      сайта: sa, en, ru, uk, es, fr, …).
//   Больше ничего менять не нужно.
//
// Какие бывают варианты строки:
//   es: { folder: 'es' }                    файлы названы заглавной буквой:
//                                           A.mp3, B.mp3 …  (по умолчанию)
//   ar: { folder: 'ar', fileCase: 'as-is' } регистр буквы не менять
//   xx: { folder: 'xx', fileCase: 'lower' } файлы строчными: a.mp3, b.mp3
//   xx: { folder: 'xx', ext: 'wav' }        другой формат (по умолчанию mp3)
//   sa: { folder: 'sanscrit', files: {…} }  имена файлов не по букве —
//                                           явная таблица «буква → файл»
// ═════════════════════════════════════════════════════════════════════════

interface LetterAudioSource {
  /** Папка внутри public/audio/letters/ */
  folder: string;
  /** Явное сопоставление «буква → имя файла»; если задано, остальные правила не применяются. */
  files?: Record<string, string>;
  /** Регистр буквы в имени файла. По умолчанию 'upper' (A.mp3, Б.mp3). */
  fileCase?: 'upper' | 'lower' | 'as-is';
  /** Расширение файлов без точки. По умолчанию 'mp3'. */
  ext?: string;
}

// ───────────── Таблицы «буква → файл» для особых языков ─────────────
const SANSKRIT_FILES: Record<string, string> = {
  'अ': '1 (a) .mp3',
  'आ': '2 (aa) .mp3',
  'इ': '3 (i) .mp3',
  'ई': '4 (ii) .mp3',
  'उ': '5 (u) .mp3',
  'ऊ': '6 (uu) .mp3',
  'ऋ': '7 (ri) .mp3',
  'ॠ': '8 (rii) .mp3',
  'ऌ': '9 (ḷ) .mp3',
  'ॡ': '9 (ḹ) .mp3',
  'ए': '10 (e) .mp3',
  'ऐ': '11 (ai) .mp3',
  'ओ': '12 (o) .mp3',
  'औ': '13 (au) .mp3',
  'क': '14 (ka) .mp3',
  'ख': '15 (kha) .mp3',
  'ग': '16 (ga) .mp3',
  'घ': '17 (gha) .mp3',
  'ङ': '18 (ṅa) .mp3',
  'च': '19 (ca) .mp3',
  'छ': '20 (cha) .mp3',
  'ज': '21 (ja) .mp3',
  'झ': '22 (jha) .mp3',
  'ञ': '23 (ña) .mp3',
  'ट': '24 (ta) .mp3',
  'ठ': '25 (tha) .mp3',
  'ड': '26 (da) .mp3',
  'ढ': '27 (dha) .mp3',
  'ण': '28 (ṇa) .mp3',
  'त': '29 (ta) .mp3',
  'थ': '30 (tha) .mp3',
  'द': '31 (da) .mp3',
  'ध': '32 (dha) .mp3',
  'न': '33 (na) .mp3',
  'प': '34 (pa) .mp3',
  'फ': '35 (pha) .mp3',
  'ब': '36 (ba) .mp3',
  'भ': '37 (bha) .mp3',
  'म': '38 (ma) .mp3',
  'य': '39 (ya) .mp3',
  'र': '40 (ra) .mp3',
  'ल': '41 (la) .mp3',
  'व': '42 (va) .mp3',
  'श': '43 (sa1) .mp3',
  'ष': '44 (sa2) .mp3',
  'स': '45 (sa3) .mp3',
  'ह': '46 (ha) .mp3',
  'ं': '47 (am) .mp3',
  'ः': '48 (ah) .mp3',
  'क्ष': '49 (ksa) .mp3',
  'ज्ञ': '50 (jna) .mp3',
  // Знаки гласных (ряд «Extra») звучат как соответствующие гласные.
  'ा': '2 (aa) .mp3',
  'ि': '3 (i) .mp3',
  'ी': '4 (ii) .mp3',
  'ु': '5 (u) .mp3',
  'ू': '6 (uu) .mp3',
  'ृ': '7 (ri) .mp3',
  'ॄ': '8 (rii) .mp3',
  'ॢ': '9 (ḷ) .mp3',
  'ॣ': '9 (ḹ) .mp3',
  'े': '10 (e) .mp3',
  'ै': '11 (ai) .mp3',
  'ो': '12 (o) .mp3',
  'ौ': '13 (au) .mp3',
};

// ───────────── НАСТРОЙКА: сюда добавляются новые языки ─────────────
const LETTER_AUDIO_SOURCES: Record<string, LetterAudioSource> = {
  sa: { folder: 'sanscrit', files: SANSKRIT_FILES },
  en: { folder: 'en' },
  ru: { folder: 'рос' },
  uk: { folder: 'укр' },
  // Примеры (раскомментируйте и поправьте папку):
  // es: { folder: 'es' },
  // fr: { folder: 'fr' },
  // hi: { folder: 'sanscrit', files: SANSKRIT_FILES }, // хинди с теми же файлами
};

// ───────────────────────────── Механика ─────────────────────────────

// Убирает пунктирный кружок ◌ и невидимые символы, которые могут стоять
// в graphemе рядом со знаками гласных.
function cleanGrapheme(grapheme: string): string {
  return grapheme.normalize('NFC').replace(/[\u25CC\u200B-\u200D\s]/g, '');
}

function fileNameFor(source: LetterAudioSource, grapheme: string): string | null {
  const g = cleanGrapheme(grapheme);
  if (!g) return null;
  if (source.files) return source.files[g] ?? null;
  const cased =
    source.fileCase === 'lower' ? g.toLowerCase() : source.fileCase === 'as-is' ? g : g.toUpperCase();
  return `${cased}.${source.ext ?? 'mp3'}`;
}

// URL файла для буквы или null (тогда сразу идёт синтез речи).
export function getLetterAudioUrl(language: string, grapheme: string): string | null {
  const source = LETTER_AUDIO_SOURCES[language];
  if (!source) return null;
  const file = fileNameFor(source, grapheme);
  if (!file) return null;
  return `/audio/letters/${encodeURIComponent(source.folder)}/${encodeURIComponent(file)}`;
}

let currentAudio: HTMLAudioElement | null = null;

function stopCurrent() {
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
  try {
    if (typeof speechSynthesis !== 'undefined') speechSynthesis.cancel();
  } catch {
    // нечего останавливать
  }
}

// Проигрывает звук буквы. Новый клик прерывает предыдущий звук.
// Если файла нет или он не воспроизвёлся — читает букву синтезатором речи.
export function playLetterSound(language: string, grapheme: string) {
  stopCurrent();

  const fallback = () => speak(grapheme, language, 0.7);
  const url = getLetterAudioUrl(language, grapheme);
  if (!url) {
    fallback();
    return;
  }

  const audio = new Audio(url);
  currentAudio = audio;
  let fellBack = false;
  const useFallback = () => {
    if (fellBack || currentAudio !== audio) return;
    fellBack = true;
    currentAudio = null;
    console.warn(`Нет звука для буквы «${grapheme}» (${language}): ${url}`);
    fallback();
  };
  audio.addEventListener('error', useFallback);
  audio.play().catch(useFallback);
}
