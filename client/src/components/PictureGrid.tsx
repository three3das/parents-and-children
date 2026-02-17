import { useState, useEffect, useCallback, useMemo } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { extractEmojiFromImage, getImagePath } from "@/lib/utils";
import { GameImageCard } from "@/components/shared/GameImageCard";
import { GameImageGrid } from "@/components/shared/GameImageGrid";

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

  const handlePictureClick = useCallback((word: Word) => {
    if (disabled || selectedPicture) return;

    const isCorrect = word.id === correctWord.id;
    if (!isCorrect) {
      playTryAgain();
    }
    onPictureSelect(word, isCorrect);
  }, [disabled, selectedPicture, correctWord.id, playTryAgain, onPictureSelect]);

  if (!correctWord || shuffledOptions.length === 0) {
    return null;
  }

  return (
    <GameImageGrid itemCount={shuffledOptions.length}>
      {shuffledOptions.map((word) => {
        const isCorrect = word.id === correctWord.id;
        const isSelected = selectedPicture?.id === word.id;
        const imagePath = getImagePath(word.image);
        const emoji = extractEmojiFromImage(word.image);

        return (
          <GameImageCard
            key={word.id}
            imagePath={imagePath}
            emoji={emoji}
            altText={word.word}
            isSelected={!!isSelected}
            isCorrect={isCorrect}
            isDisabled={!!disabled || !!selectedPicture}
            onClick={() => handlePictureClick(word)}
          />
        );
      })}
    </GameImageGrid>
  );
}
