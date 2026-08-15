import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { PICTURE_EMOJIS } from "@/lib/constants";
import { extractEmojiFromImage, getImagePath } from "@/lib/utils";

interface GamePictureDisplayProps {
  word: Word;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48',
  xl: 'w-[170px] h-[170px] sm:w-[280px] sm:h-[280px]'
};

export function GamePictureDisplay({
  word,
  disabled = false,
  size = 'md',
  animate = true
}: GamePictureDisplayProps) {

  // Debug: log missing words
  if (!PICTURE_EMOJIS[word.image]) {
    console.log('Missing emoji for word:', word.image);
  }

  const emoji = extractEmojiFromImage(word.image);
  const imagePath = getImagePath(word.image);

  const handleSpeakerClick = () => {
    if (disabled) return;

    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word.word);
      utterance.lang = 'ru-RU';
      utterance.rate = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <motion.div
        initial={animate ? { scale: 0 } : { scale: 1 }}
        animate={{ scale: 1 }}
        className={`mb-4 ${sizeClasses[size]} border-2 sm:border-4 border-gray-300 hover:border-blue-500 rounded-2xl overflow-hidden bg-white transition-colors`}
      >
        {imagePath ? (
          <img
            src={imagePath}
            alt={word.word}
            className="w-full h-full object-contain rounded-lg"
            onError={(e) => {
              console.error('Failed to load image:', imagePath);
              e.currentTarget.style.display = 'none';
            }}
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full text-8xl">
            {emoji || '❓'}
          </span>
        )}
      </motion.div>
      <motion.button
        className={`text-[#FFD700] font-bold transition-all ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        onClick={handleSpeakerClick}
        type="button"
      >
        <svg viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8">
          <path d="M11.5 3.5c.3-.2.7-.1.9.2l.1.2v16.2c0 .4-.3.7-.7.7-.1 0-.3 0-.4-.1l-4.6-3.4H3.5c-.4 0-.7-.3-.7-.7v-8.2c0-.4.3-.7.7-.7h3.3l4.7-4zm7.1 2.6c2.1 1.5 3.4 4 3.4 6.6s-1.3 5.1-3.4 6.6c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 1.7-1.2 2.8-3.2 2.8-5.5s-1.1-4.3-2.8-5.5c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1zm-2.8 2.8c1.2.9 2 2.3 2 3.8s-.8 2.9-2 3.8c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 .9-.6 1.4-1.6 1.4-2.7s-.5-2.1-1.4-2.7c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1z"/>
        </svg>
      </motion.button>
    </div>
  );
}