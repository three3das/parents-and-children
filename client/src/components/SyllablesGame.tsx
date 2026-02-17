import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { getImagePath, extractEmojiFromImage } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";

// Extended Word type with suffix
type WordWithSuffix = Word & { suffix?: string };

interface SyllablesGameProps {
    onAnswer: (isCorrect: boolean) => void;
    disabled?: boolean;
}

export function SyllablesGame({ onAnswer, disabled }: SyllablesGameProps) {
    const { t } = useLanguage();

    // Game state
    const [gameState, setGameState] = useState<'loading' | 'playing' | 'completed'>('loading');
    const [words, setWords] = useState<WordWithSuffix[]>([]);
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
                const wordsData: WordWithSuffix[] = await response.json();
                // Filter only words with suffix defined
                const wordsWithSuffix = wordsData.filter(w => w.suffix);
                const shuffled = [...wordsWithSuffix].sort(() => Math.random() - 0.5);
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

    // Get prefix (word minus suffix)
    const getPrefix = (word: WordWithSuffix): string => {
        if (!word.suffix) return word.word;
        const suffixLength = word.suffix.length;
        return word.word.slice(0, -suffixLength);
    };

    // Generate options for current word using suffixes from other words
    useEffect(() => {
        if (gameState === 'playing' && words.length > 0 && currentWordIndex < words.length) {
            const currentW = words[currentWordIndex];
            const correctSuffix = currentW.suffix || '';

            console.log('Word:', currentW.word, 'Suffix:', correctSuffix);

            if (!correctSuffix) {
                console.log('Skipping word - no suffix defined');
                handleSkip();
                return;
            }

            // Get random suffixes from other words (all will be 3 letters)
            const otherSuffixes = words
                .filter((w, i) => i !== currentWordIndex && w.suffix && w.suffix !== correctSuffix)
                .map(w => w.suffix!)
                .filter((value, index, self) => self.indexOf(value) === index); // unique

            // Pick 2 random different suffixes
            const shuffledSuffixes = [...otherSuffixes].sort(() => Math.random() - 0.5);
            const randomSuffixes = shuffledSuffixes.slice(0, 2);

            const allOptions = [correctSuffix, ...randomSuffixes].sort(() => Math.random() - 0.5);

            console.log('All options:', allOptions);

            setOptions(allOptions);
            setSelectedEnding('');
            setShowResult(false);
            setIsCorrect(false);
        }
    }, [gameState, words, currentWordIndex]);

    const currentWord = words[currentWordIndex];
    const totalQuestions = words.length;
    const progress = totalQuestions > 0 ? (currentWordIndex / totalQuestions) * 100 : 0;

    const handleEndingSelect = (ending: string) => {
        if (disabled || showResult) return;

        setSelectedEnding(ending);
        const correctSuffix = currentWord.suffix || '';

        const correct = ending === correctSuffix;
        setIsCorrect(correct);
        setShowResult(true);
        onAnswer(correct);

        if (correct) {
            setCorrectAnswers(prev => prev + 1);
        }

        // Auto-advance after showing result
        setTimeout(() => {
            if (currentWordIndex < words.length - 1) {
                setCurrentWordIndex(prev => prev + 1);
                setShowResult(false);
                setSelectedEnding('');
            } else {
                setGameState('completed');
            }
        }, 1000);
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

    const handleSkip = () => {
        setSkippedCount(prev => prev + 1);
        handleNext();
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

                    {/* Horizontal layout: Image | Prefix | Options */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        {/* Image */}
                        <div className="w-[170px] h-[170px] sm:w-[280px] sm:h-[280px] bg-white rounded-2xl border-2 sm:border-4 border-gray-300 hover:border-yellow-400 transition-colors flex items-center justify-center overflow-hidden">
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
                                                parent.innerHTML = `<span class="text-5xl">${emoji || '❓'}</span>`;
                                            }
                                        }}
                                    />
                                ) : (
                                    <span className="text-5xl">{emoji || '❓'}</span>
                                );
                            })()}
                        </div>

                        {/* Prefix */}
                        <div className="bg-white rounded-lg border-2 border-gray-300 px-4 py-6 flex items-center justify-center">
                            <span className="text-2xl font-bold text-gray-800">
                                {getPrefix(currentWord)}
                            </span>
                        </div>

                        {/* Options - vertical stack */}
                        <div className="flex flex-col gap-2">
                            {options.map((option, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: !showResult ? 1.05 : 1 }}
                                    whileTap={{ scale: !showResult ? 0.95 : 1 }}
                                    onClick={() => handleEndingSelect(option)}
                                    disabled={disabled || showResult}
                                    className={`px-4 py-2 rounded-lg border-2 font-bold text-xl transition-all min-w-[80px] ${showResult && selectedEnding === option
                                        ? isCorrect && option === currentWord.suffix
                                            ? 'bg-green-500 text-white border-green-600'
                                            : 'bg-red-500 text-white border-red-600'
                                        : showResult && option === currentWord.suffix
                                            ? 'bg-green-500 text-white border-green-600'
                                            : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                                        }`}
                                >
                                    {option}
                                </motion.button>
                            ))}
                        </div>
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
