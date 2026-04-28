import { useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { type Word } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { useLanguage } from "@/lib/i18n";
import { PictureGrid } from "./PictureGrid";

interface AudioPictureGameProps {
  word: Word;
  distractors: Word[];
  onPictureSelect: (word: Word, isCorrect: boolean) => void;
  disabled?: boolean;
  selectedPicture?: Word | null;
}

export function AudioPictureGame({
  word,
  distractors,
  onPictureSelect,
  disabled,
  selectedPicture
}: AudioPictureGameProps) {
  const { playCustomAudio } = useAudio();
  const { language } = useLanguage();

  // Get the correct audio path based on language and word ID
  const getAudioPath = useCallback(() => {
    if (!word?.id) return null;
    return `/audio/words/${language}/${word.id}.mp3`;
  }, [word?.id, language]);

  // Play audio when word changes
  const playWordAudio = useCallback(() => {
    const audioPath = getAudioPath();
    if (audioPath) {
      console.log('Playing audio:', audioPath);
      playCustomAudio(audioPath);
    }
  }, [getAudioPath, playCustomAudio]);

  // Audio will only play when speaker button is clicked

  return (
    <div>
      {/* Speaker button to replay audio */}
      <div className="text-center mb-6">
        <motion.button
          onClick={playWordAudio}
          disabled={disabled}
          className="w-24 h-24 sm:w-32 sm:h-32 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded-full text-5xl sm:text-6xl transition-colors shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(59, 130, 246, 0.7)",
              "0 0 0 20px rgba(59, 130, 246, 0)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          🔊
        </motion.button>
      </div>

      {/* Picture grid */}
      <PictureGrid
        correctWord={word}
        distractors={distractors}
        onPictureSelect={onPictureSelect}
        disabled={disabled}
        selectedPicture={selectedPicture}
      />

      {/* Pointing hand */}
      <div className="text-center mt-4 sm:mt-8">
        <motion.div
          className="text-4xl sm:text-6xl"
          animate={{
            rotate: [-10, 10, -10],
            scale: [1, 1.1, 1]
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          👆
        </motion.div>
      </div>
    </div>
  );
}
