import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/lib/i18n";
import { useAudio } from "@/hooks/useAudio";
import { getImagePath, extractEmojiFromImage } from "@/lib/utils";
import { GameImageCard } from "@/components/shared/GameImageCard";
import { GameImageGrid } from "@/components/shared/GameImageGrid";

interface MaterialWorldActivity {
    id: string;
    event: string;
    syllables: string;
    image: string;
}

interface SentenceGameProps {
    onAnswer: (isCorrect: boolean) => void;
    disabled?: boolean;
}

// NOTE: added 'loading', 'empty' and 'error' so the UI can never get stuck
// showing "Loading..." forever. Previously this component started in
// 'playing' immediately, even before any data had arrived.
type GameState = 'loading' | 'playing' | 'completed' | 'empty' | 'error';

export function SentenceGame({ onAnswer, disabled }: SentenceGameProps) {
    const { t } = useLanguage();
    const { playTryAgain } = useAudio();
    const [gameState, setGameState] = useState<GameState>('loading');
    const [activities, setActivities] = useState<MaterialWorldActivity[]>([]);
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [imageOptions, setImageOptions] = useState<MaterialWorldActivity[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [showResult, setShowResult] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [skippedCount, setSkippedCount] = useState(0);

    useEffect(() => {
        loadMaterialWorldActivities();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => {
        if (gameState === 'playing' && activities.length > 0 && currentActivityIndex >= 0 && currentActivityIndex < activities.length) {
            generateImageOptions();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [gameState, activities, currentActivityIndex]);

    const loadMaterialWorldActivities = async () => {
        setGameState('loading');
        try {
            const response = await fetch('/api/material-world');

            if (!response.ok) {
                console.error('Error loading material world activities: HTTP', response.status);
                setGameState('error');
                return;
            }

            const data = await response.json();

            const validActivities = data.filter((activity: MaterialWorldActivity) => {
                const hasEvent = activity.event && activity.event.trim() !== '';
                const hasSyllables = activity.syllables && activity.syllables.trim() !== '';
                const hasImage = activity.image && activity.image.trim() !== '';
                return hasEvent && hasSyllables && hasImage;
            });

            if (validActivities.length === 0) {
                // Data loaded fine, but nothing usable for this game mode.
                // Show an explicit empty state instead of looping forever.
                console.warn('SentenceGame: no activities with event + syllables + image were found.');
                setActivities([]);
                setTotalQuestions(0);
                setGameState('empty');
                return;
            }

            const shuffled = [...validActivities].sort(() => Math.random() - 0.5);

            setActivities(shuffled);
            setTotalQuestions(shuffled.length);
            setCurrentActivityIndex(0);
            setGameState('playing');
            // generateImageOptions will be called by useEffect when activities state updates
        } catch (error) {
            console.error('Error loading material world activities:', error);
            setGameState('error');
        }
    };

    const generateImageOptions = () => {
        if (!activities || activities.length === 0 || currentActivityIndex < 0 || currentActivityIndex >= activities.length) {
            setImageOptions([]);
            return;
        }

        const currentActivity = activities[currentActivityIndex];
        if (!currentActivity) {
            setImageOptions([]);
            return;
        }

        const otherActivities = activities.filter((_, index) => index !== currentActivityIndex);

        if (otherActivities.length < 3) {
            // Если недостаточно других активностей, используем дубликаты текущей
            const options = [currentActivity];
            while (options.length < 4) {
                options.push(currentActivity);
            }
            setImageOptions(options);
            return;
        }

        const randomActivities = [...otherActivities]
            .sort(() => Math.random() - 0.5)
            .slice(0, 3);

        const options = [currentActivity, ...randomActivities];
        const shuffledOptions = options.sort(() => Math.random() - 0.5);

        setImageOptions(shuffledOptions);
    };

    const handleImageSelect = (selectedActivity: MaterialWorldActivity) => {
        const currentActivity = activities[currentActivityIndex];
        const correct = selectedActivity.id === currentActivity.id;

        setSelectedImage(selectedActivity.id);
        setIsCorrect(correct);
        setShowResult(true);

        if (correct) {
            setCorrectAnswers(prev => prev + 1);
            onAnswer(true);

            setTimeout(() => {
                handleNext();
            }, 1000);
        } else {
            onAnswer(false);
            playTryAgain();

            setTimeout(() => {
                if (currentActivityIndex < activities.length - 1) {
                    setCurrentActivityIndex(prev => prev + 1);
                    setShowResult(false);
                    setSelectedImage('');
                } else {
                    setGameState('completed');
                }
            }, 1000);
        }
    };

    const handleNext = () => {
        if (showResult && !isCorrect) {
            setShowResult(false);
            setSelectedImage('');
            return;
        }

        if (currentActivityIndex < activities.length - 1) {
            setCurrentActivityIndex(prev => prev + 1);
            setShowResult(false);
            setSelectedImage('');
            // generateImageOptions будет вызван через useEffect
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
        setActivities([]);
        setCurrentActivityIndex(0);
        setCorrectAnswers(0);
        setSkippedCount(0);
        setShowResult(false);
        setSelectedImage('');
        loadMaterialWorldActivities();
    };

    const currentActivity = activities[currentActivityIndex];
    const progress = totalQuestions > 0 ? (currentActivityIndex / totalQuestions) * 100 : 0;

    return (
        <div className="flex flex-col items-center px-8 pt-2 pb-8">
            {/* Loading state (only shown briefly while the fetch is in flight) */}
            {gameState === 'loading' && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-xl">{t.loading}</p>
                    </div>
                </div>
            )}

            {/* Empty state: request succeeded but there is no usable data */}
            {gameState === 'empty' && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-4xl mb-4">📭</div>
                        <p className="text-xl mb-4">{t.noDataAvailable}</p>
                        <Button onClick={handleRestart} className="bg-primary hover:bg-purple-700 text-white px-6 py-2">
                            {t.playAgain}
                        </Button>
                    </div>
                </div>
            )}

            {/* Error state: the request itself failed */}
            {gameState === 'error' && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-4xl mb-4">⚠️</div>
                        <p className="text-xl mb-4">{t.loadingError}</p>
                        <Button onClick={handleRestart} className="bg-primary hover:bg-purple-700 text-white px-6 py-2">
                            {t.playAgain}
                        </Button>
                    </div>
                </div>
            )}

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

            {/*
              This branch previously could be reached forever when gameState
              was 'playing' but activities was empty (e.g. no material-world
              entries with event + syllables + image). That case is now
              caught earlier and routed to the 'empty' state above.
            */}
            {!currentActivity && gameState === 'playing' && (
                <div className="flex items-center justify-center min-h-[400px]">
                    <div className="text-center">
                        <div className="text-4xl mb-4">⏳</div>
                        <p className="text-xl">{t.loading}</p>
                    </div>
                </div>
            )}

            {currentActivity && gameState === 'playing' && (
                <>
                    <div className="w-full max-w-2xl mb-2">
                        <Progress value={progress} className="h-2" />
                        <p className="text-center text-sm text-[#FFD700] font-bold mt-2">
                            {t.question} {currentActivityIndex + 1} {t.of} {totalQuestions}
                        </p>
                    </div>

                    <div className="mb-2">
                        {imageOptions.length > 0 ? (
                            <GameImageGrid itemCount={imageOptions.length}>
                                {imageOptions.map((activity) => {
                                    const imgPath = getImagePath(activity.image);
                                    const emoji = extractEmojiFromImage(activity.image);
                                    const isActivitySelected = showResult && selectedImage === activity.id;
                                    const isActivityCorrect = activity.id === currentActivity.id;

                                    return (
                                        <GameImageCard
                                            key={activity.id}
                                            imagePath={imgPath}
                                            emoji={emoji}
                                            altText={activity.event}
                                            isSelected={!!isActivitySelected}
                                            isCorrect={isActivityCorrect}
                                            isDisabled={!!disabled || showResult}
                                            onClick={() => handleImageSelect(activity)}
                                        />
                                    );
                                })}
                            </GameImageGrid>
                        ) : (
                            <div className="text-center text-[#FFD700] font-bold">
                                {t.loadingImages}
                            </div>
                        )}
                    </div>

                    <div className="text-center mb-2">
                        <Card className="px-0.5 pt-1 pb-3 mb-2 bg-green-50 border-green-200 rounded-sm">
                            <div className="flex flex-wrap justify-center gap-3.5">
                                {currentActivity.syllables && (() => {
                                    // Разделяем слова по пробелам, затем каждое слово на слоги по дефисам
                                    const words = currentActivity.syllables.trim().split(' ');

                                    return words.map((word, wordIndex) => (
                                        <div key={wordIndex} className="inline-flex bg-white rounded-none border border-green-400/50 p-0.5">
                                            {word.split('-').map((syllable, syllableIndex) => (
                                                <div
                                                    key={syllableIndex}
                                                    className="bg-green-100 hover:bg-green-200 border border-green-300 rounded px-0.5 py-0.25 mx-0.25 text-lg font-medium transition-colors"
                                                >
                                                    {syllable}
                                                </div>
                                            ))}
                                        </div>
                                    ));
                                })() || (
                                        <span className="text-[#FFD700] font-bold">{t.syllablesNotSpecified}</span>
                                    )}
                            </div>
                        </Card>
                    </div>

                </>
            )}
        </div>
    );
}