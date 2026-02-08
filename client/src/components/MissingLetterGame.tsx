import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { useLanguage } from "@/lib/i18n";
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

interface MissingLetterGameProps {
  word: Word;
  letterOptions: string[];
  missingLetterIndex: number;
  onLetterSelect: (letter: string, isCorrect: boolean) => void;
  disabled?: boolean;
}

<<<<<<< Updated upstream
// Droppable Missing Letter Slot Component
function MissingLetterSlot({ isDropZone, filledLetter }: { isDropZone: boolean, filledLetter?: string }) {
  const { isOver, setNodeRef } = useDroppable({
    id: 'missing-letter-slot',
    data: { isMissingSlot: true },
    disabled: !isDropZone,
  });

  return (
    <motion.div
      ref={isDropZone ? setNodeRef : undefined}
      className={`w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 transition-all duration-200 ${
        filledLetter
          ? 'border-green-500 bg-green-100 text-green-700'
          : isDropZone
            ? isOver
              ? 'border-green-500 bg-green-50 text-green-600'
              : 'border-dashed border-red-400 bg-red-50 text-red-600'
            : 'border-gray-300 bg-white text-gray-800'
      }`}
      whileHover={isDropZone ? { scale: 1.05 } : {}}
      animate={
        filledLetter 
          ? { scale: [1, 1.2, 1], rotate: [0, 5, -5, 0] }
          : isDropZone && isOver 
            ? { scale: 1.1 } 
            : { scale: 1 }
      }
      transition={{ duration: 0.5 }}
    >
      {filledLetter || '?'}
    </motion.div>
  );
}

export function MissingLetterGame({ word, letterOptions, missingLetterIndex, onLetterSelect, disabled }: MissingLetterGameProps) {
  const { playLetterSound, playTryAgain } = useAudio();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [filledLetter, setFilledLetter] = useState<string | null>(null);
  const [showingResult, setShowingResult] = useState(false);
=======
export function MissingLetterGame({
  word,
  letterOptions,
  missingLetterIndex,
  onLetterSelect,
  disabled,
}: MissingLetterGameProps) {
  const { playLetterSound, playTryAgain, playApplause } = useAudio();
  const { t } = useLanguage();
  const [filledLetter, setFilledLetter] = useState<string | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
>>>>>>> Stashed changes

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
  
  const wordArray = word.word.split('');
  const correctLetter = wordArray[missingLetterIndex];

<<<<<<< Updated upstream
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const data = event.active.data.current;
    if (data?.letter) {
      playLetterSound(data.letter);
=======
  // Reset state when word changes
  useEffect(() => {
    setFilledLetter(null);
    setShowingResult(false);
    setSelectedLetter(null);
    setIsCorrectAnswer(false);
  }, [word.id, missingLetterIndex]);

  const handleLetterClick = (letter: string) => {
    console.log('MissingLetterGame: handleLetterClick called', { letter, disabled, showingResult });
    if (disabled || showingResult) {
      console.log('MissingLetterGame: Early return - disabled or showingResult');
      return;
    }

    playLetterSound(letter);
    const isCorrect = letter === correctLetter;
    console.log('MissingLetterGame: Letter check', { letter, correctLetter, isCorrect });

    setSelectedLetter(letter);
    setFilledLetter(isCorrect ? letter : correctLetter); // Always show correct letter in slot
    setShowingResult(true);
    setIsCorrectAnswer(isCorrect);

    if (isCorrect) {
      playApplause();
    } else {
      playTryAgain();
>>>>>>> Stashed changes
    }

    // Auto-advance after delay - more reliable
    const delay = isCorrect ? 1500 : 2500;
    console.log('MissingLetterGame: Setting up auto-advance', { letter, isCorrect, delay });
    setTimeout(() => {
      console.log('MissingLetterGame: Timeout triggered, calling onLetterSelect', { letter, isCorrect });
      onLetterSelect(letter, isCorrect);
    }, delay);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !active.data.current) return;

    const draggedData = active.data.current;
    const dropData = over.data.current;
    
    // Check if dropped on missing letter slot
    if (dropData?.isMissingSlot && draggedData.letter) {
      const isCorrect = draggedData.letter === correctLetter;
      
      if (isCorrect) {
        // Show the letter in place first
        setFilledLetter(draggedData.letter);
        setShowingResult(true);
        
        // Then celebrate after a short delay (keep letters hidden)
        setTimeout(() => {
          onLetterSelect(draggedData.letter, isCorrect);
          // Don't reset showingResult - keep letters hidden permanently
        }, 800);
      } else {
        // For incorrect answers, proceed immediately
        onLetterSelect(draggedData.letter, isCorrect);
      }
    }
  };

  const getActiveItem = () => {
    if (!activeId) return null;
    const index = parseInt(activeId.replace('missing-letter-', ''));
    return {
      letter: letterOptions[index],
      index
    };
  };

  const activeItem = getActiveItem();

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center space-y-8">
        {/* Picture and Speaker */}
        <GamePictureDisplay word={word} disabled={disabled} />

<<<<<<< Updated upstream
        {/* Word with Missing Letter */}
        <div className="flex gap-2 mb-8">
          {wordArray.map((letter, index) => (
            <motion.div
              key={index}
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: index * 0.1 }}
=======
      {/* Word with Missing Letter */}
      <div className="flex gap-1 sm:gap-2 mb-8 px-1">
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
              <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                <div className="w-8 h-8 sm:w-16 sm:h-16 flex items-center justify-center text-lg sm:text-3xl font-bold rounded-lg sm:rounded-xl border-2 sm:border-4 border-gray-300 bg-white text-gray-800 shadow-md sm:shadow-lg">
                  {letter}
                </div>
                <button
                  className="h-4 sm:h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                  onClick={() => playLetterSound(letter)}
                  type="button"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                    <path d="M11.5 3.5c.3-.2.7-.1.9.2l.1.2v16.2c0 .4-.3.7-.7.7-.1 0-.3 0-.4-.1l-4.6-3.4H3.5c-.4 0-.7-.3-.7-.7v-8.2c0-.4.3-.7.7-.7h3.3l4.7-4zm7.1 2.6c2.1 1.5 3.4 4 3.4 6.6s-1.3 5.1-3.4 6.6c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 1.7-1.2 2.8-3.2 2.8-5.5s-1.1-4.3-2.8-5.5c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1zm-2.8 2.8c1.2.9 2 2.3 2 3.8s-.8 2.9-2 3.8c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 .9-.6 1.4-1.6 1.4-2.7s-.5-2.1-1.4-2.7c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1z" />
                  </svg>
                </button>
              </div>
            )}
          </motion.div>
        ))}
      </div>

      {/* Letter Options - hide after answer */}
      {!showingResult && (
        <div className="flex gap-2 sm:gap-4">
          {letterOptions.map((letter, index) => (
            <motion.div
              key={index}
>>>>>>> Stashed changes
            >
              {index === missingLetterIndex ? (
                <MissingLetterSlot isDropZone={!disabled && !showingResult} filledLetter={filledLetter || undefined} />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 border-gray-300 bg-white text-gray-800">
                  {letter}
                </div>
              )}
            </motion.div>
          ))}
        </div>
<<<<<<< Updated upstream

        {/* Letter Options - hide after success */}
        {!showingResult && (
          <div className="flex gap-4">
            {letterOptions.map((letter, index) => (
              <DraggableLetter
                key={index}
                letter={letter}
                index={index}
                disabled={disabled || false}
                theme="purple"
                variant="gradient"
                size="lg"
                idPrefix="missing-letter"
              />
            ))}
          </div>
        )}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="w-20 h-20 text-4xl font-bold rounded-xl bg-purple-400 text-white shadow-2xl flex items-center justify-center">
            {activeItem.letter}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
=======
      )}

      {/* Show result after answer */}
      {showingResult && (
        <div className="flex gap-2 sm:gap-4">
          {letterOptions.map((letter, index) => {
            const isSelected = selectedLetter === letter;
            const isCorrectLetter = letter === correctLetter;

            return (
              <motion.div
                key={index}
              >
                <ClickableLetter
                  letter={letter}
                  onClick={() => { }}
                  onSpeakerClick={() => playLetterSound(letter)}
                  disabled={true}
                  theme={isSelected && !isCorrectAnswer ? 'red' : isCorrectLetter ? 'green' : 'purple'}
                  size="lg"
                  showSpeaker
                />
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Show correct answer message on wrong selection */}
      {showingResult && !isCorrectAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 rounded-lg bg-green-100 border-2 border-green-400"
        >
          <p className="font-bold text-green-800 text-lg">
            {t.correctAnswer}
          </p>
          <span className="text-2xl font-bold text-green-800">{word.word}</span>
        </motion.div>
      )}
    </div>
>>>>>>> Stashed changes
  );
}