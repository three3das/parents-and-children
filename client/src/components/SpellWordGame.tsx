import { motion } from "framer-motion";
import { useState } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { WordHighlight } from "@/components/shared/WordHighlight";
import { GamePictureDisplay } from "@/components/shared/GamePictureDisplay";
import { DraggableLetter } from "@/components/shared/DraggableLetter";
import {
  DndContext,
  DragOverlay,
  useDroppable,
  DragEndEvent,
  DragStartEvent,
  TouchSensor,
  MouseSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';

interface SpellWordGameProps {
  word: Word;
  availableLetters: string[];
  onWordComplete: (isCorrect: boolean) => void;
  onIncorrectLetter?: (letter: string) => void;
  disabled?: boolean;
}

// Droppable Position Component
function DroppablePosition({ index, letter, isIncorrect, onRemove }: { index: number, letter?: string, isIncorrect: boolean, onRemove: () => void }) {
  const { isOver, setNodeRef } = useDroppable({
    id: `position-${index}`,
    data: { index },
  });

  return (
    <motion.div
      ref={setNodeRef}
      className={`w-20 h-20 border-4 rounded-xl flex items-center justify-center text-4xl font-black text-black shadow-lg transition-all duration-300 ${isIncorrect
          ? 'border-red-500 bg-red-100 animate-pulse'
          : letter
            ? 'border-blue-500 bg-gray-100 cursor-pointer hover:bg-blue-100'
            : isOver
              ? 'border-green-500 bg-green-50'
              : 'border-dashed border-gray-400 bg-gray-50'
        }`}
      whileHover={{ scale: letter ? 1.05 : 1.02 }}
      whileTap={{ scale: 0.95 }}
      onClick={letter ? onRemove : undefined}
      animate={isIncorrect ? {
        x: [-10, 10, -10, 10, 0],
        scale: [1, 1.1, 1]
      } : {}}
      transition={{ duration: 0.6 }}
    >
      {letter || ''}
    </motion.div>
  );
}

export function SpellWordGame({ word, availableLetters, onWordComplete, onIncorrectLetter, disabled }: SpellWordGameProps) {
  const [selectedLetters, setSelectedLetters] = useState<string[]>([]);
  const [usedLetterIndices, setUsedLetterIndices] = useState<Set<number>>(new Set());
  const [showResult, setShowResult] = useState<'correct' | 'incorrect' | null>(null);
  const [incorrectLetterIndex, setIncorrectLetterIndex] = useState<number | null>(null);
  const { playTryAgain, playLetterSound } = useAudio();
  const [isCompleted, setIsCompleted] = useState(false);
  const [showingResult, setShowingResult] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Configure sensors for better touch support
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 3,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: {
      delay: 50,
      tolerance: 3,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // No sound on drag - only on click
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !active.data.current) {
      return;
    }

    const draggedData = active.data.current;
    const dropData = over.data.current;

    if (!draggedData.letter || dropData?.index === undefined) {
      return;
    }

    const { letter, index: sourceIndex } = draggedData;
    const dropIndex = dropData.index;

    // Check if this letter is correct for this position
    const correctLetter = word.word[dropIndex];
    const isCorrect = letter === correctLetter;

    if (!isCorrect) {
      // Show red highlight and play error sound
      setIncorrectLetterIndex(dropIndex);
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
    newSelectedLetters[dropIndex] = letter;

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

  const getActiveItem = () => {
    if (!activeId) return null;
    const index = parseInt(activeId.replace('letter-', ''));
    return {
      letter: availableLetters[index],
      index
    };
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

  const activeItem = getActiveItem();

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-8">
        {/* Picture Display */}
        <GamePictureDisplay word={word} disabled={disabled || !!showResult} />

        {/* Selected Letters Display */}
        <div className="flex justify-center gap-3 min-h-[100px] items-center">
          {Array.from({ length: word.word.length }).map((_, index) => (
            <DroppablePosition
              key={index}
              index={index}
              letter={selectedLetters[index]}
              isIncorrect={incorrectLetterIndex === index}
              onRemove={() => handleLetterRemove(index)}
            />
          ))}
        </div>

        {/* Available Letters */}
        <div className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto">
          {availableLetters.map((letter, index) => (
            <DraggableLetter
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
                <div key={i} className={`w-4 h-4 rounded-full ${i < selectedLetters.length ? 'bg-blue-500' : 'bg-gray-300'}`} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="w-20 h-20 rounded-xl text-3xl font-black bg-blue-400 text-white border-2 border-blue-300 flex items-center justify-center shadow-2xl">
            {activeItem.letter}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}