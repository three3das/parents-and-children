import { motion } from "framer-motion";
import { useState } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { GamePictureDisplay } from "@/components/shared/GamePictureDisplay";
import { ClickableLetter } from "@/components/shared/ClickableLetter";
import { LetterSlot } from "@/components/shared/LetterSlot";

interface SpellWordGameProps {
  word: Word;
  availableLetters: string[];
  onWordComplete: (isCorrect: boolean) => void;
  onIncorrectLetter?: (letter: string) => void;
  disabled?: boolean;
}

export function SpellWordGame({ word, availableLetters, onWordComplete, onIncorrectLetter, disabled }: SpellWordGameProps) {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [usedLetterIndices, setUsedLetterIndices] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const [incorrectLetterIndex, setIncorrectLetterIndex] = useState<number | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const { playLetterSound, playTryAgain } = useAudio();

  // Handle click on a letter - auto-place in next empty slot
  const handleLetterClick = (letter: string, sourceIndex: number) => {
    if (disabled || showResult || usedLetterIndices.has(sourceIndex)) return;

    // Play letter sound
    playLetterSound(letter);

    // Find the next empty slot
    let nextEmptySlot = -1;
    for (let i = 0; i < word.word.length; i++) {
      if (!selectedLetters[i]) {
        nextEmptySlot = i;
        break;
      }
    }

    if (nextEmptySlot === -1) return; // No empty slots

    // Check if this letter is correct for this position
    const correctLetter = word.word[nextEmptySlot];
    const isCorrect = letter === correctLetter;

    if (!isCorrect) {
      // Show red highlight and play error sound
      setIncorrectLetterIndex(nextEmptySlot);
      playTryAgain();

      // Report incorrect letter to parent for database recording
      onIncorrectLetter?.(letter);

      // Remove the highlight after animation
      setTimeout(() => {
        setIncorrectLetterIndex(null);
      }, 800);

      return;
    }

    // Letter is correct, add it
    const newSelectedLetters = [...selectedLetters];
    newSelectedLetters[nextEmptySlot] = letter;

    const newUsedIndices = new Set(Array.from(usedLetterIndices).concat([sourceIndex]));

    setSelectedLetters(newSelectedLetters);
    setUsedLetterIndices(newUsedIndices);

    // Check if word is complete
    const filledPositions = newSelectedLetters.filter(l => l).length;
    if (filledPositions === word.word.length) {
      // Celebrate immediately
      setShowResult('correct');
      setTimeout(() => {
        setShowResult(null);
        onWordComplete(true);
      }, 1500);
    }
  };

  const handleLetterRemove = (removeIndex: number) => {
    if (disabled || showResult) return;

    const newSelectedLetters = selectedLetters.filter((_, i) => i !== removeIndex);

    // Find the letter we're removing and its original index
    const removedLetter = selectedLetters[removeIndex];
    const originalIndex = availableLetters.findIndex((letter, idx) =>
      letter === removedLetter && usedLetterIndices.has(idx)
    );

    const newUsedIndices = new Set(Array.from(usedLetterIndices));
    newUsedIndices.delete(originalIndex);

    setSelectedLetters(newSelectedLetters);
    setUsedLetterIndices(newUsedIndices);
  };

  return (
    <div className="space-y-8">
      {/* Picture Display */}
      <GamePictureDisplay word={word} disabled={disabled || !!showResult} size="xl" />

      {/* Selected Letters Display */}
      <div className="flex justify-center gap-3 min-h-[100px] items-center">
        {Array.from({ length: word.word.length }).map((_, index) => (
          <LetterSlot
            key={index}
            letter={selectedLetters[index]}
            isError={incorrectLetterIndex === index}
            onClick={() => selectedLetters[index] && handleLetterRemove(index)}
          />
        ))}
      </div>

      {/* Available Letters */}
      <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
        {availableLetters.map((letter, index) => (
          <ClickableLetter
            key={index}
            letter={letter}
            index={index}
            disabled={disabled || !!showResult}
            used={usedLetterIndices.has(index)}
            theme="blue"
            size="lg"
            onClick={() => handleLetterClick(letter, index)}
          />
        ))}
      </div>

      {/* Result Display */}
      {showResult && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center mb-4"
        >
          {showResult === 'correct' ? (
            <div className="text-6xl text-green-500">
              <div className="text-8xl mb-2">🎉</div>
            </div>
          ) : (
            <div className="text-6xl text-red-500">
              <div className="text-8xl mb-2">❌</div>
              <p className="text-3xl font-bold text-[#FFD700] font-bold mt-2">{word.word}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Progress indicator */}
      {!showResult && (
        <div className="text-center text-child-text">
          <div className="flex justify-center gap-2">
            {Array.from({ length: word.word.length }).map((_, i) => (
              <div key={i} className={`w-4 h-4 rounded-full ${i < selectedLetters.length ? 'bg-blue-500' : 'bg-gray-300'}`} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}