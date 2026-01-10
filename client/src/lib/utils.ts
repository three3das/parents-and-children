import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
// Function to extract emoji from image field
export function extractEmojiFromImage(image: string): string {
    console.log('extractEmojiFromImage: processing image data:', image);
    const emojiMatch = image.match(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/u);
    console.log('extractEmojiFromImage: emoji match:', emojiMatch);
    const result = emojiMatch ? emojiMatch[0] : '';
    console.log('extractEmojiFromImage: returning:', result);
    return result;
}
// Функция для разделения русского слова на слоги
export function splitIntoSyllables(word: string): string[] {
    // Правила разделения на слоги для русского языка
    const vowels = ['а', 'о', 'у', 'ы', 'э', 'е', 'ё', 'и', 'ю', 'я'];
    const syllables: string[] = [];
    let currentSyllable = '';
    for (let i = 0; i < word.length; i++) {
        const char = word[i].toLowerCase();
        currentSyllable += word[i];
        // Если текущая буква - гласная, заканчиваем слог
        if (vowels.includes(char)) {
            // Проверяем, есть ли следующая буква и не является ли она гласной
            if (i < word.length - 1 && !vowels.includes(word[i + 1].toLowerCase())) {
                // Если следующая буква согласная, добавляем её к текущему слогу
                currentSyllable += word[i + 1];
                i++; // Пропускаем следующую букву
            }
            syllables.push(currentSyllable);
            currentSyllable = '';
        }
    }
    // Добавляем оставшиеся согласные в последний слог
    if (currentSyllable) {
        if (syllables.length > 0) {
            syllables[syllables.length - 1] += currentSyllable;
        } else {
            syllables.push(currentSyllable);
        }
    }
    return syllables.length > 0 ? syllables : [word];
}