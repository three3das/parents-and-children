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
  disabled?: boolean;
}

export function SpellWordGame({ word, availableLetters, onWordComplete, disabled }: SpellWordGameProps) {
  const [selectedLetters, setSelectedLetters] = useState<(string | null)[]>(
    Array(word.word.length).fill(null)
  );
  const [usedLetterIndices, setUsedLetterIndices] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const [errorSlotIndex, setErrorSlotIndex] = useState<number | null>(null);
  const { playLetterSound, playTryAgain } = useAudio();

  const handleLetterClick = (letter: string, letterIndex: number) => {
    if (disabled || showResult || usedLetterIndices.has(letterIndex)) return;

    // Find the next empty slot
    const nextEmptySlot = selectedLetters.findIndex((l) => l === null);
    if (nextEmptySlot === -1) return;

    // Check if this letter is correct for this position
    const correctLetter = word.word[nextEmptySlot];
    const isCorrect = letter === correctLetter;

    if (!isCorrect) {
      // Show error on the slot and play error sound
      setErrorSlotIndex(nextEmptySlot);
      playTryAgain();

      setTimeout(() => {
        setErrorSlotIndex(null);
      }, 800);
      return;
    }

    // Letter is correct, place it
    const newSelectedLetters = [...selectedLetters];
    newSelectedLetters[nextEmptySlot] = letter;

    const newUsedIndices = new Set(usedLetterIndices);
    newUsedIndices.add(letterIndex);

    setSelectedLetters(newSelectedLetters);
    setUsedLetterIndices(newUsedIndices);

    // Check if word is complete
    const filledPositions = newSelectedLetters.filter((l) => l !== null).length;
    if (filledPositions === word.word.length) {
      setShowResult('correct');
      setTimeout(() => {
        setShowResult(null);
        onWordComplete(true);
      }, 1500);
    }
  };

  const handleSlotClick = (slotIndex: number) => {
    if (disabled || showResult) return;

    const letterInSlot = selectedLetters[slotIndex];
    if (!letterInSlot) return;

    // Find the original letter index in availableLetters
    const originalIndex = availableLetters.findIndex(
      (letter, idx) => letter === letterInSlot && usedLetterIndices.has(idx)
    );

    if (originalIndex === -1) return;

    // Remove the letter from the slot and make it available again
    const newSelectedLetters = [...selectedLetters];

    // Shift all letters after this slot to the left to fill the gap
    for (let i = slotIndex; i < newSelectedLetters.length - 1; i++) {
      newSelectedLetters[i] = newSelectedLetters[i + 1];
    }
    newSelectedLetters[newSelectedLetters.length - 1] = null;

    const newUsedIndices = new Set(usedLetterIndices);
    newUsedIndices.delete(originalIndex);

    setSelectedLetters(newSelectedLetters);
    setUsedLetterIndices(newUsedIndices);
  };

  return (
    <div className="space-y-8">
      {/* Picture Display */}
      <GamePictureDisplay word={word} disabled={disabled || !!showResult} />

      {/* Selected Letters Display - Slots */}
      <div className="flex justify-center gap-3 min-h-[100px] items-center">
        {Array.from({ length: word.word.length }).map((_, index) => (
          <LetterSlot
            key={index}
            letter={selectedLetters[index] || undefined}
            placeholder=""
            onClick={() => handleSlotClick(index)}
            onSpeakerClick={() => {
              const letter = selectedLetters[index];
              if (letter) playLetterSound(letter);
            }}
            error={errorSlotIndex === index}
            size="lg"
            showSpeaker={!!selectedLetters[index]}
          />
        ))}
      </div>

      {/* Available Letters */}
      <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
        {availableLetters.map((letter, index) => (
          <ClickableLetter
            key={index}
            letter={letter}
            onClick={() => handleLetterClick(letter, index)}
            onSpeakerClick={() => playLetterSound(letter)}
            disabled={disabled || !!showResult}
            used={usedLetterIndices.has(index)}
            theme="blue"
            size="lg"
            showSpeaker
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
              <p className="text-3xl font-bold text-gray-800 mt-2">{word.word}</p>
            </div>
          )}
        </motion.div>
      )}

      {/* Progress indicator */}
      {!showResult && (
        <div className="text-center text-child-text">
          <div className="flex justify-center gap-2">
            {Array.from({ length: word.word.length }).map((_, i) => (
              <div
                key={i}
                className={`w-4 h-4 rounded-full ${
                  selectedLetters[i] !== null ? 'bg-blue-500' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
