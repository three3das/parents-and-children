import { motion } from 'framer-motion';
import {
  BORDER_WIDTH,
  BORDER_WIDTH_SELECTED,
  GOLD_100,
  GOLD_33,
  GOLD_67,
  WHITE,
} from './constants';
import type { LetterRow } from './types';

interface LetterCardProps {
  letter: LetterRow;
  isHighlighted: boolean; // буква из активной категории
  isSelected: boolean;
  onClick: () => void;
}

export function LetterCard({ letter, isHighlighted, isSelected, onClick }: LetterCardProps) {
  const background = isSelected ? GOLD_100 : isHighlighted ? GOLD_33 : WHITE;
  const textColor = isSelected ? WHITE : '#000000';
  const borderColor = isSelected ? GOLD_100 : isHighlighted ? GOLD_67 : GOLD_33;
  const borderWidth = isSelected ? BORDER_WIDTH_SELECTED : BORDER_WIDTH;

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative w-full aspect-square sm:w-10 sm:h-10 sm:aspect-auto flex flex-col items-center justify-center transition-colors flex-shrink-0"
      style={{ backgroundColor: background, border: `${borderWidth}px solid ${borderColor}` }}
    >
      {letter.sort_order != null && (
        <div
          className="absolute top-0 right-0 text-[6px] sm:text-[7px] font-bold px-0.5 leading-none"
          style={{ color: textColor }}
        >
          {letter.sort_order}
        </div>
      )}
      <div className="text-xs sm:text-sm font-bold leading-none" style={{ color: textColor }}>
        {letter.grapheme}
      </div>
    </motion.button>
  );
}