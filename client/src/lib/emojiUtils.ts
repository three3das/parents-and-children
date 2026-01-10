// Function to extract emoji from word_english field
export function extractEmojiFromWordEnglish(wordEnglish: string): string {
    const emojiMatch = wordEnglish.match(/[\\u{1F600}-\\u{1F64F}\\u{1F300}-\\u{1F5FF}\\u{1F680}-\\u{1F6FF}\\u{2600}-\\u{26FF}\\u{2700}-\\u{27BF}]/u);
    return emojiMatch ? emojiMatch[0] : '';
}