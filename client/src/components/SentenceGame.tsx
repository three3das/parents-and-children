import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { useLanguage } from "@/lib/i18n";
import { useGameAnswerLogic } from "@/hooks/useGameAnswerLogic";
import { useAudio } from "@/hooks/useAudio";

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

type GameState = 'playing' | 'completed';

export function SentenceGame({ onAnswer, disabled }: SentenceGameProps) {
    const { t } = useLanguage();
    const { playApplause, playTryAgain } = useAudio();
    const [gameState, setGameState] = useState<GameState>('playing');
    const [activities, setActivities] = useState<MaterialWorldActivity[]>([]);
    const [currentActivityIndex, setCurrentActivityIndex] = useState(0);
    const [imageOptions, setImageOptions] = useState<MaterialWorldActivity[]>([]);
    const [selectedImage, setSelectedImage] = useState<string>('');
    const [totalQuestions, setTotalQuestions] = useState(0);
    const [skippedCount, setSkippedCount] = useState(0);

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
            // Move to next activity
            if (currentActivityIndex < activities.length - 1) {
                setCurrentActivityIndex(prev => prev + 1);
                setSelectedImage('');
                resetForNewQuestion();
            } else {
                setGameState('completed');
            }
        },
    });

    useEffect(() => {
        loadMaterialWorldActivities();
    }, []);

    useEffect(() => {
        if (gameState === 'playing' && activities.length > 0 && currentActivityIndex >= 0) {
            generateImageOptions();
        }
    }, [gameState, activities.length, currentActivityIndex]);

    const loadMaterialWorldActivities = async () => {
        try {
            const response = await fetch('/api/material-world');
            const data = await response.json();

            console.log('Material World API Response:', data);

            const validActivities = data.filter((activity: MaterialWorldActivity) => {
                const hasEvent = activity.event && activity.event.trim() !== '';
                const hasSyllables = activity.syllables && activity.syllables.trim() !== '';
                const hasImage = activity.image && activity.image.trim() !== '';
                return hasEvent && hasSyllables && hasImage;
            });

            console.log('Valid activities after filtering:', validActivities.length);

            if (validActivities.length === 0) {
                console.log('No valid activities found');
                setGameState('playing');
                return;
            }

            const shuffled = [...validActivities].sort(() => Math.random() - 0.5);

            setActivities(shuffled);
            setTotalQuestions(shuffled.length);
            setCurrentActivityIndex(0);
            setGameState('playing');
<<<<<<< Updated upstream
            setTimeout(() => generateImageOptions(), 0);
=======
>>>>>>> Stashed changes
        } catch (error) {
            console.error('Error loading material world activities:', error);
        }
    };

    const generateImageOptions = () => {
        console.log('generateImageOptions called', {
            activitiesLength: activities?.length,
            currentIndex: currentActivityIndex,
            activities: activities
        });

        if (!activities || activities.length === 0 || currentActivityIndex < 0 || currentActivityIndex >= activities.length) {
            console.log('generateImageOptions: Invalid state - returning early', {
                activitiesLength: activities?.length,
                currentIndex: currentActivityIndex,
                hasActivities: !!activities,
                activitiesArray: Array.isArray(activities)
            });
            setImageOptions([]);
            return;
        }

        const currentActivity = activities[currentActivityIndex];
        if (!currentActivity) {
            console.log('generateImageOptions: No current activity at index', currentActivityIndex);
            setImageOptions([]);
            return;
        }

        const otherActivities = activities.filter((_, index) => index !== currentActivityIndex);

        // Проверяем, что достаточно других активностей для опций
        if (otherActivities.length < 3) {
<<<<<<< Updated upstream
            console.log('generateImageOptions: Not enough other activities for options');
            // Если недостаточно других активностей, используем дубликаты текущей
=======
>>>>>>> Stashed changes
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
        console.log('generateImageOptions: Set', shuffledOptions.length, 'options');
    };

    const handleImageSelect = (selectedActivity: MaterialWorldActivity) => {
        if (disabled || !canInteract) return;

        const currentActivity = activities[currentActivityIndex];
        const isCorrect = selectedActivity.id === currentActivity.id;

        setSelectedImage(selectedActivity.id);
        processAnswer(isCorrect);
    };

    const handleSkip = () => {
        setSkippedCount(prev => prev + 1);
        if (currentActivityIndex < activities.length - 1) {
            setCurrentActivityIndex(prev => prev + 1);
            setSelectedImage('');
            resetForNewQuestion();
        } else {
            setGameState('completed');
        }
    };

    const handleRestart = () => {
        setGameState('playing');
        setActivities([]);
        setCurrentActivityIndex(0);
        setSkippedCount(0);
        setSelectedImage('');
        resetForNewQuestion();
        loadMaterialWorldActivities();
    };

    const currentActivity = activities[currentActivityIndex];
    const progress = totalQuestions > 0 ? (currentActivityIndex / totalQuestions) * 100 : 0;
    const showResult = answerState !== 'idle';
    const isCorrect = answerState === 'correct';

    return (
        <div className="flex flex-col items-center px-4 pt-2 pb-8">
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
                        <p className="text-center text-sm text-gray-600 mt-2">
                            {t.question} {currentActivityIndex + 1} {t.of} {totalQuestions}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-[350px] sm:max-w-7xl mx-auto mb-2">
                        {imageOptions.length > 0 ? (
                            imageOptions.map((activity) => {
                                const imagePath = activity.image.startsWith('/images/') ? activity.image : `/images/${activity.image}`;
                                const encodedImagePath = imagePath.replace(/'/g, '%27');
<<<<<<< Updated upstream
                                console.log('Final image path:', encodedImagePath);
=======
                                const isCorrectOption = activity.id === currentActivity.id;
                                const isSelected = selectedImage === activity.id;

>>>>>>> Stashed changes
                                return (
                                    <motion.div
                                        key={activity.id}
                                        whileHover={{ scale: !showResult ? 1.05 : 1 }}
                                        whileTap={{ scale: !showResult ? 0.95 : 1 }}
                                        onClick={() => handleImageSelect(activity)}
                                        className={`w-full cursor-pointer border-2 sm:border-4 rounded-2xl flex items-center justify-center aspect-square ${isSelected
                                            ? isCorrectOption
                                                ? 'bg-green-400 border-green-600'
                                                : 'bg-red-400 border-red-600'
                                            : showResult && isCorrectOption
                                                ? 'bg-green-400 border-green-600'
                                                : 'bg-white border-gray-300'
                                            } ${disabled || !canInteract ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        <div className="w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
                                            {activity.image ? (
                                                <img
                                                    src={encodedImagePath}
                                                    alt={activity.event}
<<<<<<< Updated upstream
                                                    className="w-full h-full object-cover"
                                                    onLoad={() => console.log('Image loaded successfully:', activity.image)}
=======
                                                    className="w-full h-full object-contain"
>>>>>>> Stashed changes
                                                    onError={(e) => {
                                                        console.log('Image failed to load:', activity.image);
                                                        e.currentTarget.style.display = 'none';
                                                        const parent = e.currentTarget.parentElement;
                                                        if (parent) {
                                                            parent.innerHTML = '<span class="text-2xl sm:text-4xl">🖼️</span>';
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <span className="text-2xl sm:text-4xl">🖼️</span>
                                            )}
                                        </div>
                                    </motion.div>
                                );
                            })
                        ) : (
                            <div className="col-span-2 text-center text-gray-500">
                                {t.loadingImages}
                            </div>
                        )}
                    </div>

                    <div className="text-center mb-2">
                        <Card className="px-0.5 pt-1 pb-3 mb-2 bg-green-50 border-green-200 rounded-sm">
                            <div className="flex flex-wrap justify-center gap-3.5">
                                {currentActivity.syllables && (() => {
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
                                        <span className="text-gray-500">{t.syllablesNotSpecified}</span>
                                    )}
                            </div>
                        </Card>
                    </div>

                    {/* Show correct answer on wrong selection */}
                    {showResult && !isCorrect && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-center p-4 rounded-lg bg-green-100 border-2 border-green-400 mb-4"
                        >
                            <p className="font-bold text-green-800 text-lg">
                                {t.correctAnswer}
                            </p>
                            <div className="flex items-center justify-center gap-3 mt-2">
                                {(() => {
                                    const imagePath = currentActivity.image.startsWith('/images/') ? currentActivity.image : `/images/${currentActivity.image}`;
                                    const encodedImagePath = imagePath.replace(/'/g, '%27');
                                    return (
                                        <>
                                            <div className="w-16 h-16 bg-white rounded-lg border-2 border-green-400 flex items-center justify-center overflow-hidden">
                                                <img src={encodedImagePath} alt="" className="w-full h-full object-contain" />
                                            </div>
                                            <span className="text-xl font-bold text-green-800">{currentActivity.event}</span>
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
