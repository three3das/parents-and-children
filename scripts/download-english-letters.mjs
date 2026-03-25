// Downloads English letter sounds from Google Translate TTS
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.join(__dirname, '..', 'public', 'audio', 'letters', 'en');
fs.mkdirSync(OUT, { recursive: true });

const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function download(letter) {
  return new Promise((resolve, reject) => {
    const url = `https://translate.google.com/translate_tts?ie=UTF-8&q=${letter}&tl=en&client=tw-ob`;
    const filePath = path.join(OUT, `${letter}.mp3`);
    const file = fs.createWriteStream(filePath);

    const options = {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0 Safari/537.36',
        'Referer': 'https://translate.google.com/',
      }
    };

    https.get(url, options, (res) => {
      if (res.statusCode === 302 || res.statusCode === 301) {
        // Follow redirect
        https.get(res.headers.location, options, (res2) => {
          res2.pipe(file);
          file.on('finish', () => { file.close(); resolve(letter); });
        }).on('error', reject);
      } else {
        res.pipe(file);
        file.on('finish', () => { file.close(); resolve(letter); });
      }
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      reject(err);
    });
  });
}

// Download sequentially to avoid rate limiting
(async () => {
  for (const letter of letters) {
    try {
      await download(letter);
      console.log(`✓ ${letter}.mp3`);
      await new Promise(r => setTimeout(r, 300)); // small delay
    } catch (err) {
      console.error(`✗ ${letter}: ${err.message}`);
    }
  }
  console.log('Done! Saved to:', OUT);
})();
