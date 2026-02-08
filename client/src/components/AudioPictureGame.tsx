import { useState, useEffect, useCallback, useMemo } from "react";
<<<<<<< Updated upstream
import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { extractEmojiFromImage, getImagePath } from "@/lib/utils";

type AudioLanguage = 'ru' | 'en' | 'uk';

const LANGUAGE_LABELS: Record<AudioLanguage, string> = {
  ru: '🇷🇺',
  en: '🇬🇧',
  uk: '🇺🇦',
};

interface AudioPictureGameProps {
  correctWord: Word;
  distractors: Word[];
  onPictureSelect: (word: Word, isCorrect: boolean) => void;
  disabled?: boolean;
  selectedPicture?: Word | null;
}

export function AudioPictureGame({
  correctWord,
  distractors,
  onPictureSelect,
  disabled,
  selectedPicture
}: AudioPictureGameProps) {
  const { playTryAgain, playCustomAudio } = useAudio();
  const [currentLanguage, setCurrentLanguage] = useState<AudioLanguage>('ru');
  const [isPlaying, setIsPlaying] = useState(false);

  // Memoize shuffled options
  const shuffledOptions = useMemo(() => {
    if (correctWord) {
      const safeDistractors = Array.isArray(distractors) ? distractors : [];
      const allOptions = [correctWord, ...safeDistractors];
      if (safeDistractors.length === 0) {
        return [correctWord];
      }
      return [...allOptions].sort(() => Math.random() - 0.5);
    }
    return [];
  }, [correctWord, distractors]);

  // Get audio path for current word and language
  const getAudioPath = useCallback((wordId: string, lang: AudioLanguage): string => {
    return `/audio/words/${lang}/${wordId}.mp3`;
  }, []);

  // Play audio for current word
  const playWordAudio = useCallback(async () => {
    if (!correctWord || isPlaying) return;

    setIsPlaying(true);
    const audioPath = getAudioPath(correctWord.id, currentLanguage);

    try {
      await playCustomAudio(audioPath);
    } catch (error) {
      console.warn('Failed to play word audio:', error);
    }

    // Reset playing state after a delay
    setTimeout(() => setIsPlaying(false), 1000);
  }, [correctWord, currentLanguage, getAudioPath, playCustomAudio, isPlaying]);

  // Auto-play audio when word changes
  useEffect(() => {
    if (correctWord && !selectedPicture) {
=======
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { getImagePath, extractEmojiFromImage } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { useAudio } from "@/hooks/useAudio";
import { useGameAnswerLogic } from "@/hooks/useGameAnswerLogic";
import { ANIMATION_VARIANTS } from "@/lib/constants";

interface AudioPictureGameProps {
  onAnswer: (isCorrect: boolean) => void;
  disabled?: boolean;
}

export function AudioPictureGame({ onAnswer, disabled }: AudioPictureGameProps) {
  const { t, language } = useLanguage();
  const { playCustomAudio, playApplause, playTryAgain } = useAudio();

  // Game state
  const [gameState, setGameState] = useState<'loading' | 'playing' | 'completed'>('loading');
  const [words, setWords] = useState<Word[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);

  // Round state
  const [selectedPicture, setSelectedPicture] = useState<Word | null>(null);

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
        setSelectedPicture(null);
        resetForNewQuestion();
      } else {
        setGameState('completed');
      }
    },
  });

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

  // Generate shuffled options synchronously - this ensures audio and pictures are always in sync
  const shuffledOptions = useMemo(() => {
    if (!currentWord || words.length < 4) return [];

    // Get 3 random distractors (different from current word)
    const otherWords = words.filter(w => w.id !== currentWord.id);
    const distractors = [...otherWords].sort(() => Math.random() - 0.5).slice(0, 3);

    // Shuffle all options together
    return [currentWord, ...distractors].sort(() => Math.random() - 0.5);
  }, [currentWord, words]);

  // Play word audio for the SAME word that's shown in shuffledOptions
  const playWordAudio = useCallback(() => {
    if (!currentWord) return;
    const audioPath = `/audio/words/${language}/${currentWord.id}.mp3`;
    playCustomAudio(audioPath);
  }, [currentWord, language, playCustomAudio]);

  // Auto-play audio when word changes or language changes
  // Only play when we have valid options to display
  useEffect(() => {
    if (gameState === 'playing' && currentWord && shuffledOptions.length === 4 && answerState === 'idle') {
>>>>>>> Stashed changes
      const timer = setTimeout(() => {
        playWordAudio();
      }, 300);
      return () => clearTimeout(timer);
    }
<<<<<<< Updated upstream
  }, [correctWord?.id]);

  const handlePictureClick = useCallback((word: Word) => {
    if (disabled || selectedPicture) return;

    const isCorrect = word.id === correctWord.id;
    if (!isCorrect) {
      playTryAgain();
    }
    onPictureSelect(word, isCorrect);
  }, [disabled, selectedPicture, correctWord.id, playTryAgain, onPictureSelect]);

  const handleLanguageChange = useCallback((lang: AudioLanguage) => {
    setCurrentLanguage(lang);
    // Play audio in new language immediately
    setTimeout(() => {
      const audioPath = getAudioPath(correctWord.id, lang);
      playCustomAudio(audioPath);
    }, 100);
  }, [correctWord, getAudioPath, playCustomAudio]);

  const gridClasses = useMemo(() => {
    const optionCount = shuffledOptions.length;
    if (optionCount <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (optionCount <= 4) return "grid-cols-2 sm:grid-cols-4";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  }, [shuffledOptions.length]);

  if (!correctWord || shuffledOptions.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Language Switcher and Play Button Row */}
      <div className="flex items-center gap-4 mb-2">
        {/* Language Switcher */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {(Object.keys(LANGUAGE_LABELS) as AudioLanguage[]).map((lang) => (
            <motion.button
              key={lang}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLanguageChange(lang)}
              className={`px-3 py-2 rounded-md text-xl transition-colors ${
                currentLanguage === lang
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'bg-transparent hover:bg-gray-200'
              }`}
            >
              {LANGUAGE_LABELS[lang]}
            </motion.button>
          ))}
        </div>

        {/* Play Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={playWordAudio}
          disabled={isPlaying}
          className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl shadow-lg transition-colors ${
            isPlaying
              ? 'bg-blue-400 animate-pulse'
              : 'bg-blue-500 hover:bg-blue-600'
          } text-white`}
        >
          🔊
        </motion.button>
      </div>

      {/* Picture Grid */}
      <motion.div
        className={`grid ${gridClasses} gap-2 sm:gap-4 max-w-[350px] sm:max-w-7xl mx-auto`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {shuffledOptions.map((word) => {
          const isCorrect = word.id === correctWord.id;
          const isSelected = selectedPicture?.id === word.id;
          const imagePath = getImagePath(word.image);
          const emoji = extractEmojiFromImage(word.image);

          return (
            <div
              key={word.id}
              onClick={() => handlePictureClick(word)}
              style={{ cursor: 'pointer' }}
              className={`
                w-full cursor-pointer border-2 sm:border-4 rounded-2xl flex items-center justify-center aspect-square
                ${disabled ? 'opacity-50' : ''}
                ${isSelected ? (isCorrect ? 'bg-green-400 border-green-600' : 'bg-red-400 border-red-600') : 'bg-white border-gray-300'}
              `}
            >
              <div className="w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0"
                  whileHover={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                />

                {imagePath ? (
                  <motion.img
                    src={imagePath}
                    alt={word.word}
                    className="w-full h-full object-contain relative z-10"
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.3 }
                    }}
                    onError={(e) => {
                      console.error('Failed to load image:', imagePath);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <motion.span
                    className="text-6xl sm:text-8xl relative z-10"
                    whileHover={{
                      scale: 1.1,
                      rotate: [0, -5, 5, 0],
                      transition: { duration: 0.3 }
                    }}
                  >
                    {emoji || '❓'}
                  </motion.span>
                )}

                {isSelected && (
                  <motion.div
                    className={`
                      absolute inset-0 flex items-center justify-center text-4xl font-bold
                      ${isCorrect ? 'bg-green-500/90 text-white' : 'bg-red-500/90 text-white'}
                    `}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {isCorrect ? '✅' : '❌'}
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>
=======
  }, [currentWord, language, gameState, answerState, shuffledOptions.length, playWordAudio]);

  // Reset state when word changes
  useEffect(() => {
    setSelectedPicture(null);
  }, [currentWordIndex]);

  const handlePictureSelect = (word: Word) => {
    if (disabled || !canInteract || !currentWord) return;

    setSelectedPicture(word);
    const isCorrect = word.id === currentWord.id;
    processAnswer(isCorrect);
  };

  const handleSkip = useCallback(() => {
    setSkippedCount(prev => prev + 1);
    if (currentWordIndex < words.length - 1) {
      setCurrentWordIndex(prev => prev + 1);
      setSelectedPicture(null);
      resetForNewQuestion();
    } else {
      setGameState('completed');
    }
  }, [currentWordIndex, words.length, resetForNewQuestion]);

  const handleRestart = () => {
    setGameState('loading');
    setWords([]);
    setCurrentWordIndex(0);
    setSkippedCount(0);
    setSelectedPicture(null);
    resetForNewQuestion();
    loadWords();
  };

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
          <div className="w-full max-w-2xl mb-4">
            <Progress value={progress} className="h-2" />
            <p className="text-center text-sm text-gray-600 mt-2">
              {t.question} {currentWordIndex + 1} {t.of} {totalQuestions}
            </p>
          </div>

          {/* Play audio button */}
          <div className="mb-6 flex justify-center">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={playWordAudio}
              className="text-3xl sm:text-6xl p-3 sm:p-6 bg-green-500 hover:bg-green-600 rounded-full shadow-xl text-white"
            >
              🔊
            </motion.button>
          </div>

          {/* Picture grid - identical to PictureGrid */}
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-[350px] sm:max-w-7xl mx-auto mb-6"
            {...ANIMATION_VARIANTS.stagger}
          >
            {shuffledOptions.map((word) => {
              const isCorrectOption = word.id === currentWord.id;
              const isSelected = selectedPicture?.id === word.id;
              const imagePath = getImagePath(word.image);
              const emoji = extractEmojiFromImage(word.image);

              return (
                <div
                  key={word.id}
                  onClick={() => handlePictureSelect(word)}
                  style={{ cursor: 'pointer' }}
                  className={`
                    w-full cursor-pointer border-2 sm:border-4 rounded-2xl flex items-center justify-center aspect-square
                    ${disabled || !canInteract ? 'opacity-50' : ''}
                    ${isSelected
                      ? isCorrectOption
                        ? 'bg-green-400 border-green-600'
                        : 'bg-red-400 border-red-600'
                      : showResult && isCorrectOption
                        ? 'bg-green-400 border-green-600'
                        : 'bg-white border-gray-300'
                    }
                  `}
                >
                  <div className="w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
                    {imagePath ? (
                      <img
                        src={imagePath}
                        alt=""
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const parent = e.currentTarget.parentElement;
                          if (parent) {
                            const span = document.createElement('span');
                            span.className = 'text-6xl sm:text-8xl';
                            span.textContent = emoji || '❓';
                            parent.appendChild(span);
                          }
                        }}
                      />
                    ) : (
                      <span className="text-6xl sm:text-8xl">{emoji || '❓'}</span>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>

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
                  const imagePath = getImagePath(currentWord.image);
                  const emoji = extractEmojiFromImage(currentWord.image);
                  return (
                    <>
                      <div className="w-16 h-16 bg-white rounded-lg border-2 border-green-400 flex items-center justify-center overflow-hidden">
                        {imagePath ? (
                          <img src={imagePath} alt="" className="w-full h-full object-contain" />
                        ) : (
                          <span className="text-3xl">{emoji || '❓'}</span>
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
>>>>>>> Stashed changes
    </div>
  );
}
