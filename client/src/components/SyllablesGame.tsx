import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { extractEmojiFromImage } from "@/lib/utils";

interface SyllablesGameProps {
    word: Word;
    syllables: string[];
    correctSyllables: string[];
    onSyllableSelect: (syllable: string, isCorrect: boolean) => void;
    disabled?: boolean;
}

export function SyllablesGame({ word, syllables, correctSyllables, onSyllableSelect, disabled }: SyllablesGameProps) {
    const emoji = extractEmojiFromImage(word.image);

    return (
        <div className="text-center">
            <motion.div
                className="text-6xl mb-4"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
            >
                {emoji}
            </motion.div>

            <h2 className="text-2xl font-bold mb-4">Игра "Слоги"</h2>
            <p className="text-lg mb-4">Слово: {word.word}</p>

            <div className="flex flex-col items-center gap-3 mb-6 max-w-xs mx-auto">
                {syllables.map((syllable, index) => (
                    <motion.button
                        key={index}
                        onClick={() => onSyllableSelect(syllable, correctSyllables.includes(syllable))}
                        disabled={disabled}
                        className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-4 px-8 rounded-lg text-xl transition-colors"
                        whileHover={{ scale: disabled ? 1 : 1.05 }}
                        whileTap={{ scale: disabled ? 1 : 0.95 }}
                    >
                        {syllable}
                    </motion.button>
                ))}
            </div>

            <p className="text-sm text-gray-600">Выберите правильный слог!</p>
        </div>
    );
}