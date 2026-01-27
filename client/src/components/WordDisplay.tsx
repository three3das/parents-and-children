import { motion } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

interface WordDisplayProps {
  word: string;
}

export function WordDisplay({ word }: WordDisplayProps) {
  const { playLetterSound } = useAudio();

  const handleLetterClick = (letter: string) => {
    playLetterSound(letter);
  };

  return (
    <div className="text-center mb-8">
      <div className="flex justify-center flex-wrap gap-1.5 sm:gap-4 mb-8 px-2">
        {word.split('').map((letter, index) => (
          <motion.button
            key={`${letter}-${index}`}
            onClick={() => handleLetterClick(letter)}
            className="letter-button bg-white border-2 sm:border-4 border-primary text-primary font-bold text-3xl sm:text-6xl w-10 h-10 sm:w-20 sm:h-20 rounded-xl sm:rounded-2xl shadow-lg hover:bg-primary hover:text-white transition-all duration-300"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            {letter}
          </motion.button>
        ))}
      </div>
    </div>
  );
}
