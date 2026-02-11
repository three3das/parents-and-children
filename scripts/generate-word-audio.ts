import { db } from "../server/db";
import { words, wordTranslations } from "../shared/schema";
import { eq } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import https from "https";

// Google Translate TTS URL
function getGoogleTTSUrl(text: string, lang: string): string {
  const encodedText = encodeURIComponent(text);
  return `https://translate.google.com/translate_tts?ie=UTF-8&q=${encodedText}&tl=${lang}&client=tw-ob`;
}

// Output directory
const OUTPUT_DIR = path.join(process.cwd(), "public", "audio", "words");

// Language codes for Google TTS
const LANG_CODES = {
  ru: "ru",
  en: "en",
  uk: "uk",
};

async function downloadAudio(url: string, outputPath: string): Promise<boolean> {
  return new Promise((resolve) => {
    const file = fs.createWriteStream(outputPath);

    const request = https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://translate.google.com/',
      }
    }, (response) => {
      // Handle redirects
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

    request.on('error', (err) => {
      file.close();
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      resolve(false);
    });

    request.setTimeout(15000, () => {
      request.destroy();
      file.close();
      if (fs.existsSync(outputPath)) fs.unlinkSync(outputPath);
      resolve(false);
    });
  });
}

async function generateAudio(text: string, language: string, filename: string): Promise<boolean> {
  const langCode = LANG_CODES[language as keyof typeof LANG_CODES];
  const outputPath = path.join(OUTPUT_DIR, language, `${filename}.mp3`);

  // Skip if file already exists and has content
  if (fs.existsSync(outputPath)) {
    const stats = fs.statSync(outputPath);
    if (stats.size > 100) {
      console.log(`  ⏭️  ${language}: exists`);
      return true;
    }
  }

  const url = getGoogleTTSUrl(text, langCode);

  const success = await downloadAudio(url, outputPath);
  if (success) {
    console.log(`  ✅ ${language}: ${text}`);
  } else {
    console.log(`  ❌ ${language}: ${text}`);
  }

  return success;
}

async function main() {
  console.log("🎵 Starting audio generation for words...\n");

  // Ensure output directories exist
  for (const lang of Object.keys(LANG_CODES)) {
    const dir = path.join(OUTPUT_DIR, lang);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`Created directory: ${dir}`);
    }
  }

  // Get all words from database
  const allWords = await db.select().from(words);
  console.log(`\nFound ${allWords.length} words in database\n`);

  let generated = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < allWords.length; i++) {
    const word = allWords[i];
    console.log(`\n[${i + 1}/${allWords.length}] 📝 ${word.word}`);

    // Get translations
    const translations = await db
      .select()
      .from(wordTranslations)
      .where(eq(wordTranslations.wordId, word.id));

    const ukTranslation = translations.find(t => t.language === "uk")?.translation;
    const enTranslation = word.word_english;

    // Generate filename (use word ID)
    const filename = word.id;

    // Generate Russian audio
    const ruSuccess = await generateAudio(word.word, "ru", filename);
    if (ruSuccess) generated++; else failed++;

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 300));

    // Generate English audio (if translation exists)
    if (enTranslation) {
      const enSuccess = await generateAudio(enTranslation, "en", filename);
      if (enSuccess) generated++; else failed++;
      await new Promise(resolve => setTimeout(resolve, 300));
    } else {
      console.log(`  ⚠️  No EN`);
      skipped++;
    }

    // Generate Ukrainian audio (if translation exists)
    if (ukTranslation) {
      const ukSuccess = await generateAudio(ukTranslation, "uk", filename);
      if (ukSuccess) generated++; else failed++;
      await new Promise(resolve => setTimeout(resolve, 300));
    } else {
      console.log(`  ⚠️  No UK`);
      skipped++;
    }
  }

  console.log(`\n\n✅ Audio generation complete!`);
  console.log(`   Generated: ${generated} files`);
  console.log(`   Failed: ${failed} files`);
  console.log(`   Skipped: ${skipped} (no translation)`);

  process.exit(0);
}

main().catch(console.error);
