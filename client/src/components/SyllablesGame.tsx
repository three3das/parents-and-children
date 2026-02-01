import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { getImagePath, extractEmojiFromImage } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

// Helper function to split word into syllables (simplified)
function splitIntoSyllables(word: string): string[] {
    const vowels = ['а', 'о', 'у', 'ы', 'э', 'е', 'ё', 'и', 'ю', 'я'];
    const syllables: string[] = [];
    let currentSyllable = '';

    for (let i = 0; i < word.length; i++) {
        const char = word[i].toLowerCase();
        currentSyllable += word[i];

        if (vowels.includes(char)) {
            if (i < word.length - 1 && !vowels.includes(word[i + 1].toLowerCase())) {
                currentSyllable += word[i + 1];
                i++;
            }
            syllables.push(currentSyllable);
            currentSyllable = '';
        }
    }

    if (currentSyllable) {
        if (syllables.length > 0) {
            syllables[syllables.length - 1] += currentSyllable;
        } else {
            syllables.push(currentSyllable);
        }
    }

    return syllables.length > 0 ? syllables : [word];
}

// Generate random endings for distractors
function generateRandomEndings(correctEnding: string, count: number): string[] {
    const endings: string[] = [];
    const commonEndings = ['КА', 'ОК', 'ИК', 'А', 'О', 'Е', 'И', 'Ы', 'Я', 'Ю', 'ЕТ', 'ИТ', 'АТ', 'УТ', 'ЮТ', 'ЛА', 'ЛО', 'ЛИ', 'Л', 'ТЬ', 'ТИ', ''];

    for (let i = 0; i < count; i++) {
        let ending = commonEndings[Math.floor(Math.random() * commonEndings.length)];
        // Make sure it's different from correct ending
        while (ending === correctEnding || endings.includes(ending)) {
            ending = commonEndings[Math.floor(Math.random() * commonEndings.length)];
        }
        // Convert to uppercase to match correct ending
        endings.push(ending.toUpperCase());
    }

    return endings;
}

interface SyllablesGameProps {
    onAnswer: (isCorrect: boolean) => void;
    disabled?: boolean;
}

export function SyllablesGame({ onAnswer, disabled }: SyllablesGameProps) {
    const { t } = useLanguage();

    // Game state
    const [gameState, setGameState] = useState<'loading' | 'playing' | 'completed'>('loading');
    const [words, setWords] = useState<Word[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [skippedCount, setSkippedCount] = useState(0);

    // Round state
    const [selectedEnding, setSelectedEnding] = useState<string>('');
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [options, setOptions] = useState<string[]>([]);

    // Load words from API
    const loadWords = useCallback(async () => {
        try {
            const response = await fetch('/api/words');
            if (response.ok) {
                const wordsData = await response.json();
                const shuffled = [...wordsData].sort(() => Math.random() - 0.5);
                setWords(shuffled);
                setGameState('playing');
            }
        } catch (error) {
            console.error('Error loading words:', error);
        }
    }, []);

    // Initialize game
    useEffect(() => {
        loadWords();
    }, [loadWords]);

    const currentWord = words[currentWordIndex];
    const totalQuestions = words.length;
    const progress = totalQuestions > 0 ? (currentWordIndex / totalQuestions) * 100 : 0;

    const handleSkip = useCallback(() => {
        setSkippedCount(prev => prev + 1);
        if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
            setShowResult(false);
            setSelectedEnding('');
        } else {
            setGameState('completed');
        }
    }, [currentWordIndex, words.length]);

    // Generate options for current word
    useEffect(() => {
        if (gameState === 'playing' && words.length > 0 && currentWordIndex < words.length) {
            const word = words[currentWordIndex];
            if (!word) return;

            const wordText = word.word;
            const syllables = splitIntoSyllables(wordText);

            console.log('Word:', wordText, 'Syllables:', syllables);

            if (syllables.length < 2) {
                // Skip words that can't be split into syllables
                console.log('Skipping word - not enough syllables');
                handleSkip();
                return;
            }

            const correctEnding = syllables.slice(1).join('');

            console.log('First syllable:', syllables[0], 'Correct ending:', correctEnding);

            // Generate random endings
            const randomEndings = generateRandomEndings(correctEnding, 2);
            const allOptions = [correctEnding, ...randomEndings].sort(() => Math.random() - 0.5);

            console.log('All options:', allOptions);

            setOptions(allOptions);
            setSelectedEnding('');
            setShowResult(false);
            setIsCorrect(false);
        }
    }, [gameState, words, currentWordIndex, handleSkip]);

    const handleEndingSelect = (ending: string) => {
        if (disabled || showResult || !currentWord) return;

        setSelectedEnding(ending);
        const wordText = currentWord.word;
        const syllables = splitIntoSyllables(wordText);
        const correctEnding = syllables.slice(1).join('');

        const correct = ending === correctEnding;
        console.log('Selected ending:', ending, 'Correct ending:', correctEnding, 'Is correct:', correct);
        setIsCorrect(correct);
        setShowResult(true);
        onAnswer(correct);

        if (correct) {
            setCorrectAnswers(prev => prev + 1);
        }
    };

    const handleNext = () => {
        if (showResult && !isCorrect) {
            setShowResult(false);
            setSelectedEnding('');
            return;
        }

        if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
            setShowResult(false);
            setSelectedEnding('');
        } else {
            setGameState('completed');
        }
    };

    const handleRestart = () => {
        setGameState('loading');
        setWords([]);
        setCurrentWordIndex(0);
        setCorrectAnswers(0);
        setSkippedCount(0);
        setShowResult(false);
        setSelectedEnding('');
        loadWords();
    };

    return (
        <div className="flex flex-col items-center px-8 pt-2 pb-8">
            {gameState === 'completed' && (() => {
                const percentage = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

                return (
                    <div className="flex flex-col items-center justify-center min-h-[600px] p-8">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="text-center"
                        >
                            <div className="text-6xl mb-4">🏆</div>
                            <h2 className="text-3xl font-bold mb-4 text-primary">{t.results}</h2>

                            <div className="bg-white rounded-xl p-6 shadow-lg mb-6">
                                <p className="text-xl mb-2">
                                    {t.correctAnswers} <span className="font-bold text-green-600">{correctAnswers}</span>
                                </p>
                                <p className="text-xl mb-2">
                                    {t.totalQuestions} <span className="font-bold">{totalQuestions}</span>
                                </p>
                                <p className="text-xl mb-2">
                                    {t.skipped} <span className="font-bold text-yellow-600">{skippedCount}</span>
                                </p>
                                <p className="text-2xl font-bold text-primary">
                                    {t.percentage} {percentage}%
                                </p>
                            </div>

                            <Button onClick={handleRestart} className="bg-primary hover:bg-purple-700 text-white px-8 py-3 text-lg">
                                {t.playAgain}
                            </Button>
                        </motion.div>
                    </div>
                );
            })()}

            {!currentWord && gameState === 'playing' && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-xl">{t.loading}</p>
                    </div>
                </div>
            )}

            {currentWord && gameState === 'playing' && (
                <>
                    <div className="w-full max-w-2xl mb-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-center text-sm text-gray-600 mt-2">
                            {t.question} {currentWordIndex + 1} {t.of} {totalQuestions}
                        </p>
                    </div>

                    <Card className="p-6 bg-blue-50 border-blue-200 mb-4">
                        <h3 className="text-xl font-bold text-primary mb-4">{t.chooseCorrectEnding}</h3>

                        {/* Display image */}
                        <div className="flex justify-center mb-6">
                            <div className="w-48 h-48 bg-white rounded-xl border-4 border-gray-300 flex items-center justify-center relative overflow-hidden">
                                {(() => {
                                    const imagePath = getImagePath(currentWord.image);
                                    const emoji = extractEmojiFromImage(currentWord.image);

                                    return imagePath ? (
                                        <img
                                            src={imagePath}
                                            alt={currentWord.word}
                                            className="w-full h-full object-contain"
                                            onError={(e) => {
                                                e.currentTarget.style.display = 'none';
                                                const parent = e.currentTarget.parentElement;
                                                if (parent) {
                                                    parent.innerHTML = `<span class="text-6xl">${emoji || '❓'}</span>`;
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="text-6xl">{emoji || '❓'}</span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* Display first syllable */}
                        <div className="text-center mb-6">
                            <div className="text-3xl font-bold text-gray-800">
                                {splitIntoSyllables(currentWord.word)[0]} + ?
                            </div>
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-3 gap-4 mb-6">
                            {options.map((option, index) => {
                                const firstSyllable = splitIntoSyllables(currentWord.word)[0];
                                const fullOption = firstSyllable + option;
                                console.log('Rendering option:', option, 'Full option:', fullOption);

                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: !showResult ? 1.05 : 1 }}
                                        whileTap={{ scale: !showResult ? 0.95 : 1 }}
                                        onClick={() => handleEndingSelect(option)}
                                        disabled={disabled || showResult}
                                        className={`p-4 rounded-xl border-2 font-medium text-lg transition-all ${showResult && selectedEnding === option
                                            ? isCorrect && option === splitIntoSyllables(currentWord.word).slice(1).join('')
                                                ? 'bg-green-500 text-white border-green-600'
                                                : 'bg-red-500 text-white border-red-600'
                                            : showResult && option === splitIntoSyllables(currentWord.word).slice(1).join('')
                                                ? 'bg-green-500 text-white border-green-600'
                                                : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400'
                                            } ${disabled || showResult ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {fullOption}
                                    </motion.button>
                                );
                            })}
                        </div>

                        {showResult && !isCorrect && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-center p-3 rounded-lg bg-red-100 text-red-800 mb-4"
                            >
                                <p className="font-bold">
                                    {t.correctAnswer} {currentWord.word}
                                </p>
                            </motion.div>
                        )}
                    </Card>

                    <div className="flex gap-4 justify-center">
                        <Button
                            onClick={handleNext}
                            disabled={showResult && isCorrect}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 h-10 disabled:opacity-50"
                        >
                            {t.next}
                        </Button>
                        <Button
                            onClick={handleSkip}
                            variant="outline"
                            className="px-6 py-2 h-10"
                        >
                            {t.skip}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
