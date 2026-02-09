import { motion } from "framer-motion";

interface LetterSlotProps {
  letter: string | null;
  onClick?: () => void;
  isError?: boolean;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function LetterSlot({
  letter,
  onClick,
  isError = false,
  disabled = false,
  size = 'md'
}: LetterSlotProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-14 h-14 sm:w-16 sm:h-16 text-xl sm:text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const getStateClasses = () => {
    if (isError) {
      return 'border-red-500 bg-red-100';
    }
    if (letter) {
      return 'border-blue-500 bg-blue-100 cursor-pointer hover:bg-blue-200';
    }
    return 'border-gray-300 bg-white';
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${getStateClasses()} rounded-lg border-2 flex items-center justify-center font-bold transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      whileHover={letter && !disabled ? { scale: 1.05 } : {}}
      whileTap={letter && !disabled ? { scale: 0.95 } : {}}
      onClick={() => letter && !disabled && onClick?.()}
      animate={isError ? {
        x: [-5, 5, -5, 5, 0],
        scale: [1, 1.05, 1]
      } : {}}
      transition={isError ? { duration: 0.4 } : {}}
    >
      {letter || ''}
    </motion.div>
  );
}
