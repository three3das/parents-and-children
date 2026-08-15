import { motion } from "framer-motion";
import { useState } from "react";

interface ClickableLetterProps {
  letter: string;
  index: number;
  disabled?: boolean;
  used?: boolean;
  theme?: 'blue' | 'gray';
  size?: 'sm' | 'md' | 'lg';
  onClick?: (letter: string) => void;
  className?: string;
}

export function ClickableLetter({ 
  letter, 
  index, 
  disabled = false, 
  used = false, 
  theme = 'blue', 
  size = 'md',
  onClick,
  className = ''
}: ClickableLetterProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-lg',
    md: 'w-16 h-16 text-2xl',
    lg: 'w-20 h-20 text-3xl'
  };

  const themeClasses = {
    blue: used 
      ? 'bg-gray-300 border-gray-400 text-[#FFD700] font-bold cursor-not-allowed'
      : 'bg-blue-500 border-blue-600 text-white hover:bg-blue-600 cursor-pointer',
    gray: used 
      ? 'bg-gray-300 border-gray-400 text-[#FFD700] font-bold cursor-not-allowed'
      : 'bg-gray-500 border-gray-600 text-white hover:bg-gray-600 cursor-pointer'
  };

  return (
    <motion.div
      className={`${sizeClasses[size]} ${themeClasses[theme]} rounded-lg border-2 flex items-center justify-center font-bold transition-all duration-200 ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      whileHover={!disabled && !used ? { scale: 1.05 } : {}}
      whileTap={!disabled && !used ? { scale: 0.95 } : {}}
      onClick={() => !disabled && !used && onClick?.(letter)}
    >
      {letter}
    </motion.div>
  );
}
