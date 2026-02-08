import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { getImagePath, extractEmojiFromImage } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { useGameAnswerLogic } from "@/hooks/useGameAnswerLogic";
import { useAudio } from "@/hooks/useAudio";

<<<<<<< Updated upstream
// Extended Word type with suffix
type WordWithSuffix = Word & { suffix?: string };
=======
// Helper function to split word into syllables (Russian rules)
// Rule: when multiple consonants between vowels, keep all but the last consonant with the first syllable
function splitIntoSyllables(word: string): string[] {
    const vowels = ['а', 'о', 'у', 'ы', 'э', 'е', 'ё', 'и', 'ю', 'я'];

    // Find all vowel positions
    const vowelPositions: number[] = [];
    for (let i = 0; i < word.length; i++) {
        if (vowels.includes(word[i].toLowerCase())) {
            vowelPositions.push(i);
        }
    }

    // Words with 0 or 1 vowel can't be split
    if (vowelPositions.length <= 1) return [word];

    const syllables: string[] = [];
    let start = 0;

    for (let i = 0; i < vowelPositions.length - 1; i++) {
        const currentVowelPos = vowelPositions[i];
        const nextVowelPos = vowelPositions[i + 1];

        // Count consonants between current and next vowel
        const consonantsBetween = nextVowelPos - currentVowelPos - 1;

        if (consonantsBetween <= 1) {
            // 0 or 1 consonant: break right after current vowel
            syllables.push(word.slice(start, currentVowelPos + 1));
            start = currentVowelPos + 1;
        } else {
            // Multiple consonants: keep all but the last one with current syllable
            // Next syllable starts with the last consonant before the vowel
            const breakPoint = nextVowelPos - 1;
            syllables.push(word.slice(start, breakPoint));
            start = breakPoint;
        }
    }

    // Add the last syllable (from start to end)
    syllables.push(word.slice(start));

    return syllables;
}

// Generate random endings for distractors
function generateRandomEndings(correctEnding: string, count: number): string[] {
    const endings: string[] = [];
    const commonEndings = ['КА', 'ОК', 'ИК', 'А', 'О', 'Е', 'И', 'Ы', 'Я', 'Ю', 'ЕТ', 'ИТ', 'АТ', 'УТ', 'ЮТ', 'ЛА', 'ЛО', 'ЛИ', 'Л', 'ТЬ', 'ТИ', 'ЦО', 'ЦА', 'ЦЕ'];

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
>>>>>>> Stashed changes

interface SyllablesGameProps {
    onAnswer: (isCorrect: boolean) => void;
    disabled?: boolean;
}

export function SyllablesGame({ onAnswer, disabled }: SyllablesGameProps) {
    const { t } = useLanguage();
    const { playApplause, playTryAgain } = useAudio();

    // Game state
    const [gameState, setGameState] = useState<'loading' | 'playing' | 'completed'>('loading');
    const [words, setWords] = useState<WordWithSuffix[]>([]);
    const [currentWordIndex, setCurrentWordIndex] = useState(0);
    const [skippedCount, setSkippedCount] = useState(0);

    // Round state
    const [selectedEnding, setSelectedEnding] = useState<string>('');
    const [options, setOptions] = useState<string[]>([]);

    // Universal game answer logic
    const {
        answerState,
        canInteract,
        handleAnswer: processAnswer,
        resetForNewQuestion,
        correctCount,
        incorrectCount,
    } = useGameAnswerLogic({
        autoAdvanceOnCorrect: true,
        autoAdvanceOnIncorrect: true,
        correctAdvanceDelay: 1500,
        incorrectShowDelay: 2500,
        onCorrect: () => {
            playApplause();
            onAnswer(true);
        },
        onIncorrect: () => {
            playTryAgain();
            onAnswer(false);
        },
        onAdvance: () => {
            // Move to next word
            if (currentWordIndex < words.length - 1) {
                setCurrentWordIndex(prev => prev + 1);
                setSelectedEnding('');
                resetForNewQuestion();
            } else {
                setGameState('completed');
            }
        },
    });

    // Load words from API - filter words that can be split into 2+ syllables
    const loadWords = useCallback(async () => {
        try {
            const response = await fetch('/api/words');
            if (response.ok) {
<<<<<<< Updated upstream
                const wordsData: WordWithSuffix[] = await response.json();
                // Filter only words with suffix defined
                const wordsWithSuffix = wordsData.filter(w => w.suffix);
                const shuffled = [...wordsWithSuffix].sort(() => Math.random() - 0.5);
=======
                const wordsData = await response.json();
                // Filter out words that can't be split into 2+ syllables
                const validWords = wordsData.filter((word: Word) =>
                    splitIntoSyllables(word.word).length >= 2
                );
                const shuffled = [...validWords].sort(() => Math.random() - 0.5);
>>>>>>> Stashed changes
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

<<<<<<< Updated upstream
    // Generate options for current word using suffixes from other words
=======
    const handleSkip = useCallback(() => {
        setSkippedCount(prev => prev + 1);
        if (currentWordIndex < words.length - 1) {
            setCurrentWordIndex(prev => prev + 1);
            setSelectedEnding('');
            resetForNewQuestion();
        } else {
            setGameState('completed');
        }
    }, [currentWordIndex, words.length, resetForNewQuestion]);

    // Generate options for current word
>>>>>>> Stashed changes
    useEffect(() => {
        if (gameState === 'playing' && words.length > 0 && currentWordIndex < words.length) {
            const currentW = words[currentWordIndex];
            const correctSuffix = currentW.suffix || '';

            console.log('Word:', currentW.word, 'Suffix:', correctSuffix);

<<<<<<< Updated upstream
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
=======
            console.log('Word:', wordText, 'Syllables:', syllables);

            const correctEnding = syllables.slice(1).join('');
>>>>>>> Stashed changes

            // Pick 2 random different suffixes
            const shuffledSuffixes = [...otherSuffixes].sort(() => Math.random() - 0.5);
            const randomSuffixes = shuffledSuffixes.slice(0, 2);

            const allOptions = [correctSuffix, ...randomSuffixes].sort(() => Math.random() - 0.5);

            console.log('All options:', allOptions);

            setOptions(allOptions);
            setSelectedEnding('');
        }
    }, [gameState, words, currentWordIndex]);
<<<<<<< Updated upstream

    const currentWord = words[currentWordIndex];
    const totalQuestions = words.length;
    const progress = totalQuestions > 0 ? (currentWordIndex / totalQuestions) * 100 : 0;

    const handleEndingSelect = (ending: string) => {
        if (disabled || showResult) return;
=======

    const handleEndingSelect = (ending: string) => {
        if (disabled || !canInteract || !currentWord) return;
>>>>>>> Stashed changes

        setSelectedEnding(ending);
        const correctSuffix = currentWord.suffix || '';

<<<<<<< Updated upstream
        const correct = ending === correctSuffix;
        console.log('Selected ending:', ending, 'Correct suffix:', correctSuffix, 'Is correct:', correct);
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
=======
        const isCorrect = ending === correctEnding;
        console.log('Selected ending:', ending, 'Correct ending:', correctEnding, 'Is correct:', isCorrect);
        processAnswer(isCorrect);
>>>>>>> Stashed changes
    };

    const handleSkip = () => {
        setSkippedCount(prev => prev + 1);
        handleNext();
    };

    const handleRestart = () => {
        setGameState('loading');
        setWords([]);
        setCurrentWordIndex(0);
        setSkippedCount(0);
        setSelectedEnding('');
        resetForNewQuestion();
        loadWords();
    };

    const showResult = answerState !== 'idle';
    const isCorrect = answerState === 'correct';

    return (
        <div className="flex flex-col items-center px-8 pt-2 pb-8">
            {gameState === 'completed' && (() => {
                const percentage = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

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
                                    {t.correctAnswers} <span className="font-bold text-green-600">{correctCount}</span>
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

<<<<<<< Updated upstream
                    {/* Horizontal layout: Image | Prefix | Options */}
                    <div className="flex items-center justify-center gap-4 mb-4">
                        {/* Image */}
                        <div className="w-32 h-32 bg-white rounded-lg border-2 border-gray-300 flex items-center justify-center overflow-hidden">
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
=======
                    {/* Horizontal layout: Picture - First Syllable - Options */}
                    <div className="flex items-center justify-center gap-4 sm:gap-8 mb-6">
                        {/* Display image - styled like PictureGrid */}
                        <div className="w-32 h-32 sm:w-64 sm:h-64 bg-white border-2 sm:border-4 rounded-2xl border-gray-300 flex items-center justify-center flex-shrink-0">
                            <div className="w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
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
                                                    parent.innerHTML = `<span class="text-6xl sm:text-8xl">${emoji || '❓'}</span>`;
                                                }
                                            }}
                                        />
                                    ) : (
                                        <span className="text-6xl sm:text-8xl">{emoji || '❓'}</span>
                                    );
                                })()}
                            </div>
                        </div>

                        {/* First syllable button */}
                        <div className="flex-shrink-0">
                            <div className="px-4 sm:px-6 py-2 sm:py-3 bg-white rounded-xl border-2 border-gray-300 flex items-center justify-center shadow-md min-w-[80px] sm:min-w-[100px]">
                                <span className="text-lg sm:text-xl font-bold text-gray-800">
                                    {splitIntoSyllables(currentWord.word)[0].toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {/* Options - vertical stack */}
                        <div className="flex flex-col gap-2 sm:gap-3">
                            {options.map((option, index) => {
                                const correctEnding = splitIntoSyllables(currentWord.word).slice(1).join('');

                                return (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: !showResult ? 1.05 : 1 }}
                                        whileTap={{ scale: !showResult ? 0.95 : 1 }}
                                        onClick={() => handleEndingSelect(option)}
                                        disabled={disabled || !canInteract}
                                        className={`px-4 sm:px-6 py-2 sm:py-3 rounded-xl border-2 font-bold text-lg sm:text-xl transition-all min-w-[80px] sm:min-w-[100px] ${showResult && selectedEnding === option
                                            ? isCorrect && option === correctEnding
                                                ? 'bg-green-400 border-green-600'
                                                : 'bg-red-400 border-red-600'
                                            : showResult && option === correctEnding
                                                ? 'bg-green-400 border-green-600'
                                                : 'bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:shadow-md'
                                            } ${disabled || !canInteract ? 'cursor-not-allowed' : ''}`}
                                    >
                                        {option.toUpperCase()}
                                    </motion.button>
>>>>>>> Stashed changes
                                );
                            })()}
                        </div>
                    </div>

<<<<<<< Updated upstream
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

=======
                    {/* Show correct answer on wrong selection */}
>>>>>>> Stashed changes
                    {showResult && !isCorrect && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
<<<<<<< Updated upstream
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
=======
                            className="text-center p-4 rounded-lg bg-green-100 border-2 border-green-400 mb-4"
>>>>>>> Stashed changes
                        >
                            <p className="font-bold text-green-800 text-lg">
                                {t.correctAnswer}
                            </p>
                            <div className="flex items-center justify-center gap-3 mt-2">
                                {(() => {
                                    const imagePath = getImagePath(currentWord.image);
                                    const emoji = extractEmojiFromImage(currentWord.image);
                                    return (
                                        <>
                                            <div className="w-12 h-12 bg-white rounded-lg border-2 border-green-400 flex items-center justify-center overflow-hidden">
                                                {imagePath ? (
                                                    <img src={imagePath} alt="" className="w-full h-full object-contain" />
                                                ) : (
                                                    <span className="text-2xl">{emoji || '❓'}</span>
                                                )}
                                            </div>
                                            <span className="text-2xl font-bold text-green-800">{currentWord.word}</span>
                                        </>
                                    );
                                })()}
                            </div>
                        </motion.div>
                    )}

                    {/* Skip button only */}
                    <div className="flex gap-4 justify-center">
                        <Button
                            onClick={handleSkip}
                            variant="outline"
                            className="px-6 py-2 h-10"
                            disabled={showResult}
                        >
                            {t.skip}
                        </Button>
                    </div>
                </>
            )}
        </div>
    );
}
