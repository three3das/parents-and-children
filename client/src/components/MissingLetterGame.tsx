import { motion } from "framer-motion";
import { useState } from "react";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
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

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
    const data = event.active.data.current;
    if (data?.letter) {
      playLetterSound(data.letter);
    }
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
                <MissingLetterSlot isDropZone={!disabled && !showingResult} filledLetter={filledLetter || undefined} />
              ) : (
                <div className="w-16 h-16 flex items-center justify-center text-3xl font-bold rounded-lg border-2 border-gray-300 bg-white text-gray-800">
                  {letter}
                </div>
              )}
            </motion.div>
          ))}
        </div>

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
  );
}