import { db } from "../server/db";
import { sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import https from "https";

// Output directory for sentence audio
const OUTPUT_DIR = path.join(process.cwd(), "public", "audio", "sentences");

// Language codes for Google TTS
const LANG_CODES: Record<string, string> = {
  ru: "ru",
  en: "en",
  uk: "uk",
};

// Google Translate TTS URL
function getGoogleTTSUrl(text: string, lang: string): string {
  const encodedText = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
}

// Google Translate URL for translation
function getTranslateUrl(text: string, sourceLang: string, targetLang: string): string {
  const encodedText = encodeURIComponent(text);
  return `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodedText}`;
}

async function translateText(text: string, sourceLang: string, targetLang: string): Promise<string> {
  return new Promise((resolve) => {
    const url = getTranslateUrl(text, sourceLang, targetLang);

    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      }
    }, (response) => {
      let data = '';
      response.on('data', chunk => data += chunk);
      response.on('end', () => {
        try {
          const result = JSON.parse(data);
          // Extract translated text from response
          const translated = result[0]?.map((item: any) => item[0]).join('') || text;
          resolve(translated);
        } catch {
          resolve(text); // Return original on error
        }
      });
    }).on('error', () => {
      resolve(text);
    });
  });
}

async function downloadAudio(url: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(outputPath);

    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://translate.google.com/',
      }
    }, (response) => {
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          file.close();
          if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
          downloadAudio(redirectUrl, outputPath).then(resolve);
          return;
        }
      }

      if (response.statusCode !== 200) {
        file.close();
        if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
        resolve(false);
        return;
      }

      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(true);
      });
    });

    request.on('error', () => {
      file.close();
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      resolve(false);
    });

    request.setTimeout(30000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      resolve(false);
    });
  });
}

async function generateAudio(text: string, language: string, filename: string): Promise<boolean> {
  const langCode = LANG_CODES[language];
  const langDir = path.join(OUTPUT_DIR, language);
  const outputPath = path.join(langDir, `${filename}.mp3`);

  // Skip if file already exists and has content
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    if (stats.size > 100) {
      console.log(`  ⏭️  ${language}: exists`);
      return true;
    }
  }

  // Clean text for TTS (remove stress marks)
  const cleanText = text.replace(/[\u0301\u0300]/g, '');

  const url = getGoogleTTSUrl(cleanText, langCode);
  const success = await downloadAudio(url, outputPath);

  if (success) {
    console.log(`  ✅ ${language}: generated`);
  } else {
    console.log(`  ❌ ${language}: failed`);
  }

  return success;
}

async function main() {
  console.log("🎵 Starting sentence audio generation...\n");

  // Ensure output directories exist
  for (const lang of Object.keys(LANG_CODES)) {
    const dir = path.join(OUTPUT_DIR, lang);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }

  // Get all sentences from material_world
  const result = await db.execute(sql`
    SELECT id, event, event_en, event_uk
    FROM public.material_world
    ORDER BY id
  `);

  const sentences = result.rows as any[];
  console.log(`\nFound ${sentences.length} sentences in database\n`);

  let stats = { generated: 0, failed: 0, translated: 0 };

  for (let i = 0; i < sentences.length; i++) {
    const sentence = sentences[i];
    const shortId = sentence.id.split('-').pop(); // Use last part of UUID as filename

    console.log(`\n[${i + 1}/${sentences.length}] 📝 ${sentence.event.substring(0, 50)}...`);

    // Get or translate texts
    let textRu = sentence.event;
    let textEn = sentence.event_en;
    let textUk = sentence.event_uk;

    // Translate if needed
    if (!textEn) {
      console.log(`  🔄 Translating to English...`);
      textEn = await translateText(textRu, 'ru', 'en');
      stats.translated++;
      await new Promise(r => setTimeout(r, 500)); // Rate limit
    }

    if (!textUk) {
      console.log(`  🔄 Translating to Ukrainian...`);
      textUk = await translateText(textRu, 'ru', 'uk');
      stats.translated++;
      await new Promise(r => setTimeout(r, 500)); // Rate limit
    }

    // Update translations in database
    await db.execute(sql`
      UPDATE public.material_world
      SET event_en = ${textEn}, event_uk = ${textUk}
      WHERE id = ${sentence.id}
    `);

    // Generate audio files
    const ruSuccess = await generateAudio(textRu, 'ru', shortId);
    if (ruSuccess) stats.generated++; else stats.failed++;
    await new Promise(r => setTimeout(r, 300));

    const enSuccess = await generateAudio(textEn, 'en', shortId);
    if (enSuccess) stats.generated++; else stats.failed++;
    await new Promise(r => setTimeout(r, 300));

    const ukSuccess = await generateAudio(textUk, 'uk', shortId);
    if (ukSuccess) stats.generated++; else stats.failed++;
    await new Promise(r => setTimeout(r, 300));

    // Update audio paths in database
    const audioPathRu = `/audio/sentences/ru/${shortId}.mp3`;
    const audioPathEn = `/audio/sentences/en/${shortId}.mp3`;
    const audioPathUk = `/audio/sentences/uk/${shortId}.mp3`;

    await db.execute(sql`
      UPDATE public.material_world
      SET audio_ru = ${audioPathRu},
          audio_en = ${audioPathEn},
          audio_uk = ${audioPathUk}
      WHERE id = ${sentence.id}
    `);
  }

  console.log(`\n\n✅ Audio generation complete!`);
  console.log(`   Generated: ${stats.generated} audio files`);
  console.log(`   Failed: ${stats.failed} audio files`);
  console.log(`   Translated: ${stats.translated} sentences`);

  process.exit(0);
}

main().catch(console.error);
