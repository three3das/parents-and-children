import { motion } from "framer-motion";
import { useState, useEffect, useCallback, useMemo } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { PICTURE_EMOJIS, ANIMATION_VARIANTS, GAME_CONFIG } from "@/lib/constants";
import { extractEmojiFromImage, getImagePath } from "@/lib/utils";
// ... остальной код компонента
interface PictureGridProps {
  correctWord: Word;
  distractors: Word[];
  onPictureSelect: (word: Word, isCorrect: boolean) => void;
  disabled?: boolean;
  selectedPicture?: Word | null;
}
export function PictureGrid({
  correctWord,
  distractors,
  onPictureSelect,
  disabled,
  selectedPicture
}: PictureGridProps) {
  const { playTryAgain } = useAudio();

  // Memoize shuffled options to prevent unnecessary reshuffling
  const shuffledOptions = useMemo(() => {
    if (correctWord) {
      // Проверяем, что distractors существует и является массивом
      const safeDistractors = Array.isArray(distractors) ? distractors : [];
      const allOptions = [correctWord, ...safeDistractors];

      // Если distractors не загружены, добавляем заглушки
      if (safeDistractors.length === 0) {
        return [correctWord];
      }
      return [...allOptions].sort(() => Math.random() - 0.5);
    }
    return [];
  }, [correctWord, distractors]);

  const handlePictureClick = useCallback((word: Word) => {
    console.log('handlePictureClick called for:', word.word, 'disabled:', disabled, 'selectedPicture:', selectedPicture);
    console.log('onPictureSelect function:', onPictureSelect);
    if (disabled || selectedPicture) return; // Prevent multiple clicks

    const isCorrect = word.id === correctWord.id;
    console.log('Calling onPictureSelect with:', word.word, 'isCorrect:', isCorrect);
    if (!isCorrect) {
      playTryAgain();
    }
    onPictureSelect(word, isCorrect);
    console.log('onPictureSelect called, should see MixGame log next');
  }, [disabled, selectedPicture, correctWord.id, playTryAgain, onPictureSelect]);

  // Memoize grid classes to prevent recalculation
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
    <motion.div
      className={`grid ${gridClasses} gap-2 sm:gap-4 max-w-[350px] sm:max-w-7xl mx-auto`}
      {...ANIMATION_VARIANTS.stagger}
    >
      {shuffledOptions.map((word, index) => {
        const isCorrect = word.id === correctWord.id;
        const isSelected = selectedPicture?.id === word.id;
        const imagePath = getImagePath(word.image);
        const emoji = extractEmojiFromImage(word.image);

        console.log('Rendering word:', word.word, 'image:', word.image, 'imagePath:', imagePath, 'emoji:', emoji);
        console.log('isSelected:', isSelected, 'selectedPicture:', selectedPicture?.word);

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
              {/* Background glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0"
                whileHover={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
              />

              {/* Image or Emoji */}
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

              {/* Success/Error overlay */}
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
  );
}
