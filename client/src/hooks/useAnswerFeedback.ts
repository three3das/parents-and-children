import { useCallback } from "react";
import { useAudio } from "./useAudio";

interface UseAnswerFeedbackOptions {
  onCorrect?: () => void;
  onIncorrect?: () => void;
  enableSound?: boolean;
}

/**
 * Универсальный хук для озвучивания и обратной связи ответов
 * 
 * Логика озвучивания:
 * - Правильный ответ: playApplause()
 * - Неправильный ответ: playTryAgain()
 */
export function useAnswerFeedback(options: UseAnswerFeedbackOptions = {}) {
  const { playApplause, playTryAgain } = useAudio();
  const { onCorrect, onIncorrect, enableSound = true } = options;

  const handleCorrectAnswer = useCallback(() => {
    if (enableSound) {
      playApplause();
    }
    onCorrect?.();
  }, [playApplause, onCorrect, enableSound]);

  const handleIncorrectAnswer = useCallback(() => {
    if (enableSound) {
      playTryAgain();
    }
    onIncorrect?.();
  }, [playTryAgain, onIncorrect, enableSound]);

  return {
    handleCorrectAnswer,
    handleIncorrectAnswer,
  };
}
