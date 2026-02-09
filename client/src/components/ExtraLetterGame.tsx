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

interface ExtraLetterGameProps {
  word: Word;
  wordWithExtraLetter: string;
  extraLetterIndex: number;
  onLetterRemove: (index: number, isCorrect: boolean) => void;
  disabled?: boolean;
}

// Droppable Trash Zone Component
function TrashZone() {
  const { isOver, setNodeRef } = useDroppable({
    id: 'trash-zone',
    data: { isTrash: true },
  });

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
  );
}