import { motion } from "framer-motion";
import { useState } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { useLanguage } from "@/lib/i18n";
import { GamePictureDisplay } from "@/components/shared/GamePictureDisplay";
<<<<<<< Updated upstream
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
=======
import { getImagePath, extractEmojiFromImage } from "@/lib/utils";
>>>>>>> Stashed changes

interface ExtraLetterGameProps {
  word: Word;
  wordWithExtraLetter: string;
  extraLetterIndex: number;
  onLetterRemove: (index: number, isCorrect: boolean) => void;
  disabled?: boolean;
}

<<<<<<< Updated upstream
// Droppable Trash Zone Component
function TrashZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: 'trash-zone',
    data: { isTrash: true },
  });
=======
export function ExtraLetterGame({
  word,
  wordWithExtraLetter,
  extraLetterIndex,
  onLetterRemove,
  disabled,
}: ExtraLetterGameProps) {
  const { t } = useLanguage();
  const [removedLetterIndex, setRemovedLetterIndex] = useState<number | null>(null);
  const [errorLetterIndex, setErrorLetterIndex] = useState<number | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const [isCorrectAnswer, setIsCorrectAnswer] = useState(false);
  const { playLetterSound, playTryAgain, playApplause } = useAudio();
>>>>>>> Stashed changes

  return (
    <motion.div
      ref={setNodeRef}
      className={`w-32 h-32 rounded-2xl border-4 border-dashed flex flex-col items-center justify-center text-center transition-all duration-300 ${
        isOver 
          ? 'border-red-500 bg-red-50 text-red-600' 
          : 'border-gray-400 bg-gray-50 text-gray-500'
      }`}
      whileHover={{ scale: 1.05 }}
      animate={isOver ? { scale: 1.1 } : { scale: 1 }}
    >
      <div className="text-4xl mb-2">🗑️</div>
      <div className="text-sm font-medium">Drop extra letter here</div>
    </motion.div>
  );
}

export function ExtraLetterGame({ word, wordWithExtraLetter, extraLetterIndex, onLetterRemove, disabled }: ExtraLetterGameProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [removedLetterIndex, setRemovedLetterIndex] = useState<number | null>(null);
  const [showingResult, setShowingResult] = useState(false);
  const { playLetterSound } = useAudio();

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
  
  const wordArray = wordWithExtraLetter.split('');

<<<<<<< Updated upstream
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    // No sound for extra letter game
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over || !active.data.current) return;

    const draggedData = active.data.current;
    const dropData = over.data.current;
    
    // Check if dropped on trash zone
    if (dropData?.isTrash && draggedData.index !== undefined) {
      const isCorrect = draggedData.index === extraLetterIndex;
      
      if (isCorrect) {
        // Remove the letter and celebrate immediately
        setRemovedLetterIndex(draggedData.index);
        onLetterRemove(draggedData.index, isCorrect);
      } else {
        // For incorrect answers, proceed immediately
        onLetterRemove(draggedData.index, isCorrect);
      }
=======
  const handleLetterClick = (index: number) => {
    console.log('ExtraLetterGame: handleLetterClick called', { index, disabled, removedLetterIndex, showingResult });
    if (disabled || removedLetterIndex !== null || showingResult) {
      console.log('ExtraLetterGame: Early return - disabled, removedLetterIndex, or showingResult');
      return;
    }

    const isCorrect = index === extraLetterIndex;
    setIsCorrectAnswer(isCorrect);
    console.log('ExtraLetterGame: Letter check', { index, extraLetterIndex, isCorrect });

    if (isCorrect) {
      setRemovedLetterIndex(index);
      playApplause();
      console.log('ExtraLetterGame: Correct answer - calling onLetterRemove');
      onLetterRemove(index, isCorrect);
    } else {
      setErrorLetterIndex(index);
      setShowingResult(true);
      playTryAgain();

      // Auto-advance after showing correct answer
      console.log('ExtraLetterGame: Incorrect answer - setting up auto-advance');
      setTimeout(() => {
        console.log('ExtraLetterGame: Timeout triggered, calling onLetterRemove');
        setErrorLetterIndex(null);
        setShowingResult(false);
        onLetterRemove(index, isCorrect);
      }, 2500);
>>>>>>> Stashed changes
    }
  };

  const getActiveItem = () => {
    if (!activeId) return null;
    const index = parseInt(activeId.replace('extra-letter-', ''));
    return {
      letter: wordArray[index],
      index
    };
  };

  const activeItem = getActiveItem();

  return (
<<<<<<< Updated upstream
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col items-center space-y-8">
        {/* Picture and Speaker */}
        <GamePictureDisplay word={word} disabled={disabled} />

        {/* Word with extra letter - draggable */}
        <div className="flex gap-2 mb-8">
          {wordArray.map((letter, index) => {
            // Completely hide removed letter to close the gap
            if (removedLetterIndex === index) {
              return null;
            }
            
            return (
              <DraggableLetter
                key={index}
                letter={letter}
                index={index}
                disabled={false}
                theme="gray"
                variant="outline"
                size="md"
                idPrefix="extra-letter"
                onClick={(letter) => playLetterSound(letter)}
              />
            );
          })}
        </div>

        {/* Trash Zone */}
        <TrashZone />
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeItem ? (
          <div className="w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 border-red-400 bg-red-50 text-red-600 shadow-2xl">
            {activeItem.letter}
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
=======
    <div className="flex flex-col items-center space-y-8">
      {/* Picture and Speaker */}
      <GamePictureDisplay word={word} disabled={disabled} size="lg" />

      {/* Word with extra letter - clickable */}
      <div className="flex gap-0.5 sm:gap-2 mb-8 px-1">
        {wordArray.map((letter, index) => {
          // Hide removed letter
          if (removedLetterIndex === index) {
            return null;
          }

          return (
            <motion.div
              key={index}
              className="flex flex-col items-center gap-0.5 sm:gap-1"
              initial={{ y: -20, opacity: 0 }}
              animate={
                errorLetterIndex === index
                  ? { y: 0, opacity: 1, x: [-5, 5, -5, 5, 0] }
                  : { y: 0, opacity: 1 }
              }
              transition={{ delay: index * 0.1, duration: 0.3 }}
            >
              <button
                onClick={() => handleLetterClick(index)}
                disabled={disabled || showingResult}
                className={`w-7 h-7 sm:w-16 sm:h-16 flex items-center justify-center text-lg sm:text-3xl font-bold rounded-lg sm:rounded-xl border-2 sm:border-4 shadow-md sm:shadow-lg transition-all
                  ${disabled || showingResult ? 'cursor-not-allowed' : 'cursor-pointer hover:scale-105'}
                  ${errorLetterIndex === index
                    ? 'border-red-500 bg-red-100 text-red-800'
                    : showingResult && index === extraLetterIndex
                      ? 'border-green-500 bg-green-100 text-green-800'
                      : 'border-gray-300 bg-white text-gray-800 hover:border-gray-400'
                  }`}
              >
                {letter}
              </button>
              <button
                className="h-4 sm:h-6 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  playLetterSound(letter);
                }}
                type="button"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="w-3 h-3 sm:w-4 sm:h-4">
                  <path d="M11.5 3.5c.3-.2.7-.1.9.2l.1.2v16.2c0 .4-.3.7-.7.7-.1 0-.3 0-.4-.1l-4.6-3.4H3.5c-.4 0-.7-.3-.7-.7v-8.2c0-.4.3-.7.7-.7h3.3l4.7-4zm7.1 2.6c2.1 1.5 3.4 4 3.4 6.6s-1.3 5.1-3.4 6.6c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 1.7-1.2 2.8-3.2 2.8-5.5s-1.1-4.3-2.8-5.5c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1zm-2.8 2.8c1.2.9 2 2.3 2 3.8s-.8 2.9-2 3.8c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 .9-.6 1.4-1.6 1.4-2.7s-.5-2.1-1.4-2.7c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1z" />
                </svg>
              </button>
            </motion.div>
          );
        })}
      </div>

      {/* Show correct answer on wrong selection */}
      {showingResult && !isCorrectAnswer && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center p-4 rounded-lg bg-green-100 border-2 border-green-400"
        >
          <p className="font-bold text-green-800 text-lg">
            {t.correctAnswer}
          </p>
          <div className="flex items-center justify-center gap-3 mt-2">
            {(() => {
              const imagePath = getImagePath(word.image);
              const emoji = extractEmojiFromImage(word.image);
              return (
                <>
                  <div className="w-12 h-12 bg-white rounded-lg border-2 border-green-400 flex items-center justify-center overflow-hidden">
                    {imagePath ? (
                      <img src={imagePath} alt="" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-2xl">{emoji || '❓'}</span>
                    )}
                  </div>
                  <span className="text-2xl font-bold text-green-800">{word.word}</span>
                </>
              );
            })()}
          </div>
        </motion.div>
      )}
    </div>
>>>>>>> Stashed changes
  );
}