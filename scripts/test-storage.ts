import { storage } from "../server/storage";

async function test() {
  try {
    console.log("Testing storage.getAllWordsWithTranslations('uk')...");
    const words = await storage.getAllWordsWithTranslations('uk');
    console.log("First 3 words:", words.slice(0, 3));
    console.log("Total words:", words.length);
  } catch (error) {
    console.error("Error:", error);
  }

  process.exit(0);
}

test();
