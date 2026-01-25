import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}
// Function to extract emoji from image field
export function extractEmojiFromImage(image: string): string {
    console.log('extractEmojiFromImage: processing image data:', image);
    // Simple emoji detection - check if string contains common emoji patterns
    const hasEmoji = /[\uD83C-\uDBFF\uDC00-\uDFFF]/.test(image);
    console.log('extractEmojiFromImage: has emoji:', hasEmoji);
    const result = hasEmoji ? image : '';
    console.log('extractEmojiFromImage: returning:', result);
    return result;
}

// Mapping of English image names to numeric file IDs
const IMAGE_MAPPING: Record<string, string> = {
    // Animals
    'elephant': '1001',
    'cat': '1002',
    'fox': '1003',
    'dog': '1004',
    'fish': '1005',
    'bear': '1006',
    'rabbit': '1007',
    'wolf': '1008',
    'frog': '1009',
    'butterfly': '1010',
    'bee': '1011',
    'bird': '1012',

    // Objects
    'house': '1013',
    'ball': '1014',
    'table': '1015',
    'tree': '1016',
    'car': '1017',
    'chair': '1018',
    'window': '1019',
    'door': '1020',
    'lamp': '1021',
    'clock': '1022',
    'phone': '1023',
    'tv': '1024',
    'computer': '1025',
    'airplane': '1026',
    'train': '1027',
    'bus': '1028',
    'bicycle': '1029',
    'ship': '1030',

    // Nature
    'sun': '1031',
    'moon': '1032',
    'star': '1033',
    'cloud': '1034',
    'flower': '1035',

    // Food
    'bread': '1036',
    'milk': '1037',
    'apple': '1038',

    // School
    'book': '1039',
    'pencil': '1040',

    // Family
    'mother': '1041',
    'father': '1042',
    'uncle': '1043',
    'aunt': '1044',
    'brother': '1045',
    'sister': '1046',
    'grandfather': '1047',
    'grandmother': '1048',
    'son': '1049',
    'daughter': '1050'
};

// Function to get image path from image field
export function getImagePath(image: string): string {
    console.log('getImagePath: input image:', image);

    // If image contains emoji, return empty string to use emoji system
    if (extractEmojiFromImage(image)) {
        console.log('getImagePath: detected emoji, returning empty string');
        return '';
    }

    // If image already starts with /images/, return as-is
    if (image.startsWith('/images/')) {
        console.log('getImagePath: image already has path, returning:', image);
        return image;
    }

    // If image is a number (like "1001"), construct image path
    if (/^\d+$/.test(image)) {
        const path = `/images/${image}.jpg`;
        console.log('getImagePath: numeric image, path:', path);
        return path;
    }

    // If image is an English word, map it to numeric file ID
    if (/^[a-zA-Z]+$/.test(image)) {
        const mappedId = IMAGE_MAPPING[image.toLowerCase()];
        if (mappedId) {
            const path = `/images/${mappedId}.jpg`;
            console.log('getImagePath: mapped English word', image, 'to', path);
            return path;
        }
        // Fallback: try direct English name
        const fallbackPath = `/images/${image}.jpg`;
        console.log('getImagePath: no mapping found, trying fallback:', fallbackPath);
        return fallbackPath;
    }

    console.log('getImagePath: no pattern matched, returning empty string');
    // Default fallback
    return '';
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