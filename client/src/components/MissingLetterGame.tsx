import { motion } from "framer-motion";
import { useState } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { GamePictureDisplay } from "@/components/shared/GamePictureDisplay";
import { ClickableLetter } from "@/components/shared/ClickableLetter";
import { LetterSlot } from "@/components/shared/LetterSlot";

interface MissingLetterGameProps {
  word: Word;
  letterOptions: string[];
  missingLetterIndex: number;
  onLetterSelect: (letter: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

export function MissingLetterGame({
  word,
  letterOptions,
  missingLetterIndex,
  onLetterSelect,
  disabled,
}: MissingLetterGameProps) {
  const { playLetterSound, playTryAgain } = useAudio();
  const [filledLetter, setFilledLetter] = useState<string | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const [errorLetter, setErrorLetter] = useState<string | null>(null);

  const wordArray = word.word.split('');
  const correctLetter = wordArray[missingLetterIndex];

  const handleLetterClick = (letter: string) => {
    if (disabled || showingResult) return;

    playLetterSound(letter);
    const isCorrect = letter === correctLetter;

    if (isCorrect) {
      // Show the letter in place first
      setFilledLetter(letter);
      setShowingResult(true);

      // Then proceed after a short delay
      setTimeout(() => {
        onLetterSelect(letter, isCorrect);
      }, 800);
    } else {
      // Show error animation
      setErrorLetter(letter);
      playTryAgain();

      setTimeout(() => {
        setErrorLetter(null);
      }, 600);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-8">
      {/* Picture and Speaker */}
      <GamePictureDisplay word={word} disabled={disabled} />

      {/* Word with Missing Letter */}
      <div className="flex gap-2 mb-8">
        {wordArray.map((letter, index) => (
          <motion.div
            key={index}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 }}
          >
            {index === missingLetterIndex ? (
              <LetterSlot
                letter={filledLetter || undefined}
                placeholder="?"
                highlighted={!!filledLetter}
                size="md"
                showSpeaker={!!filledLetter}
                onSpeakerClick={() => {
                  if (filledLetter) playLetterSound(filledLetter);
                }}
              />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <div className="w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-xl border-4 border-gray-300 bg-white text-gray-800 shadow-lg">
                  {letter}
                </div>
                <button
                  className="h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => playLetterSound(letter)}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M11.5 3.5c.3-.2.7-.1.9.2l.1.2v16.2c0 .4-.3.7-.7.7-.1 0-.3 0-.4-.1l-4.6-3.4H3.5c-.4 0-.7-.3-.7-.7v-8.2c0-.4.3-.7.7-.7h3.3l4.7-4zm7.1 2.6c2.1 1.5 3.4 4 3.4 6.6s-1.3 5.1-3.4 6.6c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 1.7-1.2 2.8-3.2 2.8-5.5s-1.1-4.3-2.8-5.5c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1zm-2.8 2.8c1.2.9 2 2.3 2 3.8s-.8 2.9-2 3.8c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 .9-.6 1.4-1.6 1.4-2.7s-.5-2.1-1.4-2.7c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1z"/>
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Letter Options - hide after success */}
      {!showingResult && (
        <div className="flex gap-4">
          {letterOptions.map((letter, index) => (
            <motion.div
              key={index}
              animate={
                errorLetter === letter
                  ? { x: [-5, 5, -5, 5, 0] }
                  : {}
              }
              transition={{ duration: 0.4 }}
            >
              <ClickableLetter
                letter={letter}
                onClick={() => handleLetterClick(letter)}
                onSpeakerClick={() => playLetterSound(letter)}
                disabled={disabled}
                theme="purple"
                size="lg"
                showSpeaker
              />
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
