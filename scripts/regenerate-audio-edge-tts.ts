import { db } from "../server/db";
import { words, wordTranslations } from "../shared/schema";
import { eq, sql } from "drizzle-orm";
import * as fs from "fs";
import * as path from "path";
import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts";

// Voice choices for each language - natural sounding voices
const VOICES: Record<string, string> = {
  en: "en-US-AvaMultilingualNeural",   // Natural female voice
  ru: "ru-RU-SvetlanaNeural",           // Russian female voice
  uk: "uk-UA-PolinaNeural",             // Ukrainian female voice
};

// Which languages to regenerate (pass as CLI args, e.g.: en uk)
const langsToRegenerate = process.argv.slice(2);
if (langsToRegenerate.length === 0) {
  console.log("Usage: npx tsx scripts/regenerate-audio-edge-tts.ts <lang1> [lang2] ...");
  console.log("Example: npx tsx scripts/regenerate-audio-edge-tts.ts en");
  console.log("Example: npx tsx scripts/regenerate-audio-edge-tts.ts en uk ru");
  console.log("\nAvailable languages: en, ru, uk");
  process.exit(1);
}

const WORDS_DIR = path.join(process.cwd(), "public", "audio", "words");
const SENTENCES_DIR = path.join(process.cwd(), "public", "audio", "sentences");

async function generateWithEdgeTTS(text: string, voice: string, outputPath: string): Promise<boolean> {
  try {
    const tts = new MsEdgeTTS();
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3);

    const { audioStream } = tts.toStream(text);

    return new Promise((resolve) => {
      const chunks: Buffer[] = [];

      audioStream.on("data", (chunk: Buffer) => {
        chunks.push(chunk);
      });

      audioStream.on("end", () => {
        const buffer = Buffer.concat(chunks);
        if (buffer.length > 100) {
          fs.writeFileSync(outputPath, buffer);
          resolve(true);
        } else {
          resolve(false);
        }
      });

      audioStream.on("error", (err: Error) => {
        console.error(`    Error: ${err.message}`);
        resolve(false);
      });
    });
  } catch (err: any) {
    console.error(`    Error: ${err.message}`);
    return false;
  }
}

async function regenerateWordAudio() {
  console.log("\n=== Regenerating WORD audio ===\n");

  const allWords = await db.select().from(words);
  console.log(`Found ${allWords.length} words\n`);

  let generated = 0;
  let failed = 0;

  for (let i = 0; i < allWords.length; i++) {
    const word = allWords[i];
    console.log(`[${i + 1}/${allWords.length}] ${word.word}`);

    // Get translations
    const translations = await db
      .select()
      .from(wordTranslations)
      .where(eq(wordTranslations.wordId, word.id));

    const filename = `${word.id}.mp3`;

    for (const lang of langsToRegenerate) {
      let text = "";
      if (lang === "ru") {
        text = word.word;
      } else if (lang === "en") {
        text = word.word_english || "";
      } else if (lang === "uk") {
        const ukT = translations.find(t => t.language === "uk");
        text = ukT?.translation || "";
      }

      if (!text) {
        console.log(`  ⚠️  ${lang}: no text`);
        continue;
      }

      const outputPath = path.join(WORDS_DIR, lang, filename);
      const voice = VOICES[lang];

      const success = await generateWithEdgeTTS(text, voice, outputPath);
      if (success) {
        console.log(`  ✅ ${lang}: ${text}`);
        generated++;
      } else {
        console.log(`  ❌ ${lang}: ${text}`);
        failed++;
      }

      // Small delay between requests
      await new Promise(r => setTimeout(r, 200));
    }
  }

  return { generated, failed };
}

async function regenerateSentenceAudio() {
  console.log("\n=== Regenerating SENTENCE audio ===\n");

  const result = await db.execute(sql`SELECT * FROM material_world ORDER BY id`);
  const activities = result.rows as any[];
  console.log(`Found ${activities.length} sentences\n`);

  let generated = 0;
  let failed = 0;

  for (let i = 0; i < activities.length; i++) {
    const activity = activities[i];
    const event = activity.event;
    console.log(`[${i + 1}/${activities.length}] ${event}`);

    const filename = `${activity.id}.mp3`;

    for (const lang of langsToRegenerate) {
      let text = "";
      if (lang === "ru") {
        text = event;
      } else if (lang === "en") {
        text = activity.event_en || "";
      } else if (lang === "uk") {
        text = activity.event_uk || "";
      }

      if (!text) {
        console.log(`  ⚠️  ${lang}: no text`);
        continue;
      }

      const outputPath = path.join(SENTENCES_DIR, lang, filename);
      const voice = VOICES[lang];

      const success = await generateWithEdgeTTS(text, voice, outputPath);
      if (success) {
        console.log(`  ✅ ${lang}: ${text}`);
        generated++;
      } else {
        console.log(`  ❌ ${lang}: ${text}`);
        failed++;
      }

      await new Promise(r => setTimeout(r, 200));
    }
  }

  return { generated, failed };
}

async function main() {
  console.log("🎵 Edge TTS Audio Regeneration");
  console.log(`Languages: ${langsToRegenerate.join(", ")}`);
  console.log(`Voices: ${langsToRegenerate.map(l => `${l}=${VOICES[l]}`).join(", ")}`);

  // Ensure directories exist
  for (const lang of langsToRegenerate) {
    for (const dir of [WORDS_DIR, SENTENCES_DIR]) {
      const langDir = path.join(dir, lang);
      if (!fs.existsSync(langDir)) {
        fs.mkdirSync(langDir, { recursive: true });
      }
    }
  }

  const wordResult = await regenerateWordAudio();
  const sentenceResult = await regenerateSentenceAudio();

  console.log("\n\n=== RESULTS ===");
  console.log(`Words:     ${wordResult.generated} generated, ${wordResult.failed} failed`);
  console.log(`Sentences: ${sentenceResult.generated} generated, ${sentenceResult.failed} failed`);

  process.exit(0);
}

main().catch(console.error);
