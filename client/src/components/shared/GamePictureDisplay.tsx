import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { PICTURE_EMOJIS } from "@/lib/constants";
import { extractEmojiFromImage, getImagePath } from "@/lib/utils";

interface GamePictureDisplayProps {
  word: Word;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  animate?: boolean;
}

const sizeClasses = {
  sm: 'w-24 h-24',
  md: 'w-32 h-32',
  lg: 'w-48 h-48'
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
    <div className="text-center">
      <motion.div
        initial={animate ? { scale: 0 } : { scale: 1 }}
        animate={{ scale: 1 }}
        className={`mb-4 ${sizeClasses[size]}`}
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
      <motion.div
        className={`text-4xl mb-2 transition-transform ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:scale-110'}`}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.95 } : {}}
        onClick={handleSpeakerClick}
      >
        🔊
      </motion.div>
    </div>
  );
}