import { motion } from "framer-motion";
import { ReactNode } from "react";

interface AnswerHighlightProps {
  children: ReactNode;
  isCorrect?: boolean;
  isIncorrect?: boolean;
  isSelected?: boolean;
  showResult?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Универсальный компонент для подсветки ответов во всех играх
 * 
 * Логика подсветки:
 * - Правильный ответ: зеленая рамка (bg-green-400 border-green-600)
 * - Неправильный ответ: красная рамка (bg-red-400 border-red-600)
 * - Показ правильного ответа: зеленая рамка (bg-green-400 border-green-600)
 * - Обычное состояние: белая рамка (bg-white border-gray-300)
 */
export function AnswerHighlight({
  children,
  isCorrect = false,
  isIncorrect = false,
  isSelected = false,
  showResult = false,
  disabled = false,
  className = "",
}: AnswerHighlightProps) {
  const getHighlightClasses = () => {
    // Если выбран неправильный ответ
    if (isSelected && isIncorrect) {
      return "bg-red-400 border-red-600";
    }
    
    // Если выбран правильный ответ
    if (isSelected && isCorrect) {
      return "bg-green-400 border-green-600";
    }
    
    // Если показываем результат и это правильный ответ (но не выбран)
    if (showResult && isCorrect && !isSelected) {
      return "bg-green-400 border-green-600";
    }
    
    // Обычное состояние
    return "bg-white border-gray-300";
  };

  return (
    <motion.div
      whileHover={!disabled && !showResult ? { scale: 1.05 } : {}}
      whileTap={!disabled && !showResult ? { scale: 0.95 } : {}}
      className={`${getHighlightClasses()} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
    >
      {children}
    </motion.div>
  );
}
