import { useState, useCallback } from 'react';

interface GameResults {
  correctAnswers: number;
  totalQuestions: number;
}

interface UseGameLoopProps<T> {
  items: T[];
  onComplete: (results: GameResults) => void;
}

export function useGameLoop<T>({ items, onComplete }: UseGameLoopProps<T>) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);

  const currentItem = items[currentIndex];
  const isComplete = currentIndex >= items.length;

  const handleCorrect = useCallback(() => {
    const newCorrect = correctAnswers + 1;
    setCorrectAnswers(newCorrect);

    if (currentIndex + 1 >= items.length) {
      onComplete({ correctAnswers: newCorrect, totalQuestions: items.length });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [correctAnswers, currentIndex, items.length, onComplete]);

  const handleIncorrect = useCallback(() => {
    if (currentIndex + 1 >= items.length) {
      onComplete({ correctAnswers, totalQuestions: items.length });
    } else {
      setCurrentIndex((i) => i + 1);
    }
  }, [correctAnswers, currentIndex, items.length, onComplete]);

  const reset = useCallback(() => {
    setCurrentIndex(0);
    setCorrectAnswers(0);
  }, []);

  const results: GameResults = {
    correctAnswers,
    totalQuestions: items.length,
  };

  return {
    currentIndex,
    currentItem,
    correctAnswers,
    handleCorrect,
    handleIncorrect,
    isComplete,
    results,
    reset,
  };
}
