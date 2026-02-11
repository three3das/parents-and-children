import { useState, useCallback } from 'react';
import { useAudio } from './useAudio';

export type AnswerState = 'idle' | 'correct' | 'incorrect';

interface UseGameAnswerLogicOptions {
  /** Delay before showing correct answer and advancing after incorrect answer (ms) */
  incorrectShowDelay?: number;
  /** Delay before auto-advancing after correct answer (ms) */
  correctAdvanceDelay?: number;
  /** Whether to auto-advance to next question on correct answer */
  autoAdvanceOnCorrect?: boolean;
  /** Whether to auto-advance to next question on incorrect answer (after showing correct) */
  autoAdvanceOnIncorrect?: boolean;
  /** Callback when answer is correct */
  onCorrect?: () => void;
  /** Callback when answer is incorrect */
  onIncorrect?: () => void;
  /** Callback for advancing to next question */
  onAdvance?: () => void;
}

interface UseGameAnswerLogicReturn {
  /** Current answer state */
  answerState: AnswerState;
  /** Whether user can interact (not processing an answer) */
  canInteract: boolean;
  /** Handle user's answer submission */
  handleAnswer: (isCorrect: boolean) => void;
  /** Fully reset state for new question */
  resetForNewQuestion: () => void;
  /** Manually advance to next question */
  advance: () => void;
  /** Number of correct answers in current session */
  correctCount: number;
  /** Number of incorrect answers in current session */
  incorrectCount: number;
}

const DEFAULT_OPTIONS: Required<UseGameAnswerLogicOptions> = {
  incorrectShowDelay: 2000,  // Show correct answer for 2 seconds
  correctAdvanceDelay: 1500,
  autoAdvanceOnCorrect: true,
  autoAdvanceOnIncorrect: true,  // Auto-advance after showing correct answer
  onCorrect: () => {},
  onIncorrect: () => {},
  onAdvance: () => {},
};

/**
 * Universal hook for game answer logic.
 * Provides consistent behavior for correct/incorrect answers across all games:
 * - Plays appropriate sounds (victory/applause for correct, try-again for incorrect)
 * - Manages answer state and visual feedback
 * - Shows correct answer on incorrect selection
 * - Auto-advances to next question
 * - Tracks correct/incorrect answer counts
 */
export function useGameAnswerLogic(
  options: UseGameAnswerLogicOptions = {}
): UseGameAnswerLogicReturn {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  const { playApplause, playTryAgain } = useAudio();

  const [answerState, setAnswerState] = useState<AnswerState>('idle');
  const [canInteract, setCanInteract] = useState(true);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);

  const handleAnswer = useCallback((isCorrect: boolean) => {
    if (!canInteract) return;

    setCanInteract(false);

    if (isCorrect) {
      setAnswerState('correct');
      setCorrectCount(prev => prev + 1);

      // Play victory/applause sound
      playApplause();

      // Call onCorrect callback
      opts.onCorrect?.();

      // Auto-advance after delay if enabled
      if (opts.autoAdvanceOnCorrect) {
        setTimeout(() => {
          opts.onAdvance?.();
        }, opts.correctAdvanceDelay);
      }
    } else {
      setAnswerState('incorrect');
      setIncorrectCount(prev => prev + 1);

      // Play try-again sound
      playTryAgain();

      // Call onIncorrect callback
      opts.onIncorrect?.();

      // Auto-advance after showing correct answer
      if (opts.autoAdvanceOnIncorrect) {
        setTimeout(() => {
          opts.onAdvance?.();
        }, opts.incorrectShowDelay);
      }
    }
  }, [canInteract, opts, playApplause, playTryAgain]);

  const resetForNewQuestion = useCallback(() => {
    setAnswerState('idle');
    setCanInteract(true);
  }, []);

  const advance = useCallback(() => {
    resetForNewQuestion();
    opts.onAdvance?.();
  }, [resetForNewQuestion, opts]);

  return {
    answerState,
    canInteract,
    handleAnswer,
    resetForNewQuestion,
    advance,
    correctCount,
    incorrectCount,
  };
}
