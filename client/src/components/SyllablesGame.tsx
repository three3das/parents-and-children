import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { type Word } from "@shared/schema";

interface SyllablesGameProps {
    word: Word | string;
    firstSyllable: string;
    options: string[];
    correctAnswer: string;
    onAnswer: (isCorrect: boolean) => void;
    disabled?: boolean;
}

export function SyllablesGame({ word, firstSyllable, options, correctAnswer, onAnswer, disabled }: SyllablesGameProps) {
    console.log('SyllablesGame props:', { word, firstSyllable, options, correctAnswer });
    const [selectedSyllables, setSelectedSyllables] = useState<string[]>([]);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);

    // Получаем текст слова из объекта или строки
    const wordText = typeof word === 'string' ? word : word.word;

    const handleSyllableClick = (syllable: string) => {
        if (disabled || showResult) return;

        const newSelection = [...selectedSyllables];
        const syllableIndex = newSelection.indexOf(syllable);

        if (syllableIndex > -1) {
            newSelection.splice(syllableIndex, 1);
        } else {
            newSelection.push(syllable);
        }

        setSelectedSyllables(newSelection);
    };

    const handleSubmit = () => {
        if (selectedSyllables.length === 0) return;

        const correct = selectedSyllables.join('') === correctAnswer;

        setIsCorrect(correct);
        setShowResult(true);
        onAnswer(correct);
    };

    const handleReset = () => {
        setSelectedSyllables([]);
        setShowResult(false);
        setIsCorrect(false);
    };

    return (
        <div className="flex flex-col items-center space-y-6">
            <Card className="p-6 bg-blue-50 border-blue-200">
                <h3 className="text-xl font-bold text-primary mb-4">Соберите слово из слогов:</h3>
                <p className="text-2xl font-bold text-gray-800 mb-6">{wordText}</p>

                <div className="flex flex-wrap justify-center gap-3 mb-6">
                    {Array.isArray(options) && options.length > 0 ? (
                        options.map((syllable, index) => (
                            <motion.button
                                key={index}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={() => handleSyllableClick(syllable)}
                                disabled={disabled || showResult}
                                className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${selectedSyllables.includes(syllable)
                                    ? 'bg-blue-500 text-white border-blue-500'
                                    : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400'
                                    } ${disabled || showResult ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {syllable}
                            </motion.button>
                        ))
                    ) : (
                        <div className="text-center py-8">
                            <div className="text-2xl">❌</div>
                            <p className="text-sm text-gray-500">Ошибка загрузки слогов</p>
                        </div>
                    )}
                </div>

                {showResult && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`text-center p-3 rounded-lg ${isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}
                    >
                        <p className="font-bold">
                            {isCorrect ? '✅ Правильно!' : '❌ Неправильно!'}
                        </p>
                        {!isCorrect && (
                            <p className="text-sm mt-1">
                                Правильный ответ: {correctAnswer}
                            </p>
                        )}
                    </motion.div>
                )}

                <div className="flex gap-4 justify-center">
                    <Button
                        onClick={handleSubmit}
                        disabled={disabled || showResult || selectedSyllables.length === 0}
                        className="bg-blue-500 hover:bg-blue-600 text-white"
                    >
                        Проверить
                    </Button>

                    {(showResult || selectedSyllables.length > 0) && (
                        <Button
                            onClick={handleReset}
                            variant="outline"
                        >
                            Сбросить
                        </Button>
                    )}
                </div>
            </Card>
        </div>
    );
}