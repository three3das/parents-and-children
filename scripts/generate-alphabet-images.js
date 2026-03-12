// Generates three 600×600 SVG alphabet images into public/images/
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const OUT = path.join(__dirname, '..', 'public', 'images');

function makeSVG(pairs) {
  const W = 600, H = 600;
  const PAD = 16;

  const n = pairs.length;
  // English 26 → 6 cols×5 rows;  Cyrillic 33 → 7 cols×5 rows
  const cols = n <= 26 ? 6 : 7;
  const rows = Math.ceil(n / cols);

  const contentTop = PAD;
  const cellW = (W - PAD * 2) / cols;
  const cellH = (H - PAD * 2) / rows;
  const fs1 = Math.min(cellH * 0.52, cellW * 0.42); // uppercase size
  const fs2 = fs1 * 0.82;                             // lowercase size

  let texts = '';
  pairs.forEach(([up, lo], i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const cx = PAD + col * cellW + cellW / 2;
    const cy = contentTop + row * cellH + cellH * 0.62;

    const halfW = (fs1 * 0.6 + fs2 * 0.5) / 2;
    const x1 = cx - halfW + fs1 * 0.3;
    const x2 = cx + fs2 * 0.1;

    texts += `  <text x="${x1.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" font-size="${fs1.toFixed(1)}" font-weight="900" font-family="Arial,Helvetica,sans-serif" fill="white" style="text-shadow:0 2px 6px rgba(0,0,0,0.3)">${up}</text>\n`;
    texts += `  <text x="${x2.toFixed(1)}" y="${cy.toFixed(1)}" text-anchor="middle" font-size="${fs2.toFixed(1)}" font-weight="700" font-family="Arial,Helvetica,sans-serif" fill="white" opacity="0.80">${lo}</text>\n`;
  });

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FF5252"/>
      <stop offset="100%" stop-color="#E00000"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
${texts}</svg>`;
}

// ── Alphabets ────────────────────────────────────────────────────────────────

const ru = [
  ['А','а'],['Б','б'],['В','в'],['Г','г'],['Д','д'],['Е','е'],['Ё','ё'],
  ['Ж','ж'],['З','з'],['И','и'],['Й','й'],['К','к'],['Л','л'],['М','м'],
  ['Н','н'],['О','о'],['П','п'],['Р','р'],['С','с'],['Т','т'],['У','у'],
  ['Ф','ф'],['Х','х'],['Ц','ц'],['Ч','ч'],['Ш','ш'],['Щ','щ'],['Ъ','ъ'],
  ['Ы','ы'],['Ь','ь'],['Э','э'],['Ю','ю'],['Я','я'],
];

const uk = [
  ['А','а'],['Б','б'],['В','в'],['Г','г'],['Ґ','ґ'],['Д','д'],['Е','е'],
  ['Є','є'],['Ж','ж'],['З','з'],['И','и'],['І','і'],['Ї','ї'],['Й','й'],
  ['К','к'],['Л','л'],['М','м'],['Н','н'],['О','о'],['П','п'],['Р','р'],
  ['С','с'],['Т','т'],['У','у'],['Ф','ф'],['Х','х'],['Ц','ц'],['Ч','ч'],
  ['Ш','ш'],['Щ','щ'],['Ь','ь'],['Ю','ю'],['Я','я'],
];

const en = [
  ['A','a'],['B','b'],['C','c'],['D','d'],['E','e'],['F','f'],['G','g'],
  ['H','h'],['I','i'],['J','j'],['K','k'],['L','l'],['M','m'],['N','n'],
  ['O','o'],['P','p'],['Q','q'],['R','r'],['S','s'],['T','t'],['U','u'],
  ['V','v'],['W','w'],['X','x'],['Y','y'],['Z','z'],
];

// ── Write files ───────────────────────────────────────────────────────────────

fs.mkdirSync(OUT, { recursive: true });

fs.writeFileSync(path.join(OUT, 'letters_russian.svg'), makeSVG(ru));
fs.writeFileSync(path.join(OUT, 'letters_ukrainian.svg'), makeSVG(uk));
fs.writeFileSync(path.join(OUT, 'letters_english.svg'), makeSVG(en));

console.log('✓ letters_russian.svg');
console.log('✓ letters_ukrainian.svg');
console.log('✓ letters_english.svg');
console.log('Saved to:', OUT);
