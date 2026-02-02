import { useState, useEffect, useCallback, useMemo } from "react";
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
      const timer = setTimeout(() => {
        playWordAudio();
      }, 300);
      return () => clearTimeout(timer);
    }
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
    </div>
  );
}
