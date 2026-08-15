import { motion } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";

interface WordDisplayProps {
  word: string;
}

export function WordDisplay({ word }: WordDisplayProps) {
  const { playLetterSound } = useAudio();

  return (
    <div className="flex justify-center gap-2 mb-4">
      {word.split('').map((letter, index) => (
        <motion.div
          key={`${letter}-${index}`}
          className="flex flex-col items-center gap-1"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center text-2xl sm:text-3xl font-bold rounded-xl border-4 border-gray-300 bg-white text-[#FFD700] font-bold shadow-lg">
            {letter}
          </div>
          <button
            className="h-6 flex items-center justify-center text-[#FFD700] font-bold transition-colors"
            onClick={() => playLetterSound(letter)}
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
              <path d="M11.5 3.5c.3-.2.7-.1.9.2l.1.2v16.2c0 .4-.3.7-.7.7-.1 0-.3 0-.4-.1l-4.6-3.4H3.5c-.4 0-.7-.3-.7-.7v-8.2c0-.4.3-.7.7-.7h3.3l4.7-4zm7.1 2.6c2.1 1.5 3.4 4 3.4 6.6s-1.3 5.1-3.4 6.6c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 1.7-1.2 2.8-3.2 2.8-5.5s-1.1-4.3-2.8-5.5c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1zm-2.8 2.8c1.2.9 2 2.3 2 3.8s-.8 2.9-2 3.8c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 .9-.6 1.4-1.6 1.4-2.7s-.5-2.1-1.4-2.7c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1z"/>
            </svg>
          </button>
        </motion.div>
      ))}
    </div>
  );
}
