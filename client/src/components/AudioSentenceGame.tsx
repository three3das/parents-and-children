import { useEffect, useCallback, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { type MaterialWorld } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { useLanguage } from "@/lib/i18n";
import { getImagePath } from "@/lib/utils";

// Image component with fallback
function MaterialWorldImage({ item, disabled, selectedItem }: { item: MaterialWorld; disabled?: boolean; selectedItem?: MaterialWorld | null }) {
  const [imageError, setImageError] = useState(false);
  const imagePath = getImagePath(item.image);

  // Reset error state when item changes
  useEffect(() => {
    setImageError(false);
  }, [item.id]);

  if (!imagePath || imageError) {
    return (
      <motion.span className="text-6xl sm:text-8xl relative z-10">
        🖼️
      </motion.span>
    );
  }

  return (
    <motion.img
      src={imagePath}
      alt={item.event}
      className="w-full h-full object-contain relative z-10"
      whileHover={!disabled && !selectedItem ? { scale: 1.05 } : {}}
      onError={() => {
        console.error('Failed to load image:', imagePath);
        setImageError(true);
      }}
    />
  );
}

interface AudioSentenceGameProps {
  sentence: MaterialWorld;
  distractors: MaterialWorld[];
  onSelect: (item: MaterialWorld, isCorrect: boolean) => void;
  disabled?: boolean;
  selectedItem?: MaterialWorld | null;
}

export function AudioSentenceGame({
  sentence,
  distractors,
  onSelect,
  disabled,
  selectedItem
}: AudioSentenceGameProps) {
  const { playCustomAudio, playTryAgain } = useAudio();
  const { language } = useLanguage();

  // Get the correct audio path based on selected language
  const getAudioPath = useCallback(() => {
    if (!sentence?.id) return null;

    // Get language-specific audio path
    if (language === 'ru' && (sentence as any).audio_ru) {
      return (sentence as any).audio_ru;
    } else if (language === 'en' && (sentence as any).audio_en) {
      return (sentence as any).audio_en;
    } else if (language === 'uk' && (sentence as any).audio_uk) {
      return (sentence as any).audio_uk;
    }

    return null; // No audio file - will use speech synthesis
  }, [sentence?.id, sentence, language]);

  // Get the sentence text based on selected language
  const getSentenceText = useCallback(() => {
    if (!sentence) return '';

    if (language === 'en' && (sentence as any).event_en) {
      return (sentence as any).event_en;
    } else if (language === 'uk' && (sentence as any).event_uk) {
      return (sentence as any).event_uk;
    }

    return sentence.event; // Default to Russian
  }, [sentence, language]);

  // Play audio using file or speech synthesis as fallback
  const playSentenceAudio = useCallback(() => {
    const audioPath = getAudioPath();

    if (audioPath) {
      // Play audio file
      console.log('Playing sentence audio file:', audioPath);
      playCustomAudio(audioPath);
    } else {
      // Fallback to speech synthesis
      const text = getSentenceText();
      if (text) {
        console.log('Using speech synthesis for:', text);
        try {
          speechSynthesis.cancel();

          const utterance = new SpeechSynthesisUtterance(text);
          if (language === 'ru') {
            utterance.lang = 'ru-RU';
          } else if (language === 'uk') {
            utterance.lang = 'uk-UA';
          } else {
            utterance.lang = 'en-US';
          }
          utterance.rate = 0.85;
          utterance.pitch = 1.1;
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.warn('Speech synthesis not available:', error);
        }
      }
    }
  }, [getAudioPath, getSentenceText, playCustomAudio, language]);

  // Auto-play audio when sentence changes
  useEffect(() => {
    if (sentence?.id && !disabled) {
      const timer = setTimeout(() => {
        playSentenceAudio();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [sentence?.id, disabled, playSentenceAudio]);

  // Shuffle options
  const shuffledOptions = useMemo(() => {
    if (!sentence) return [];
    const allOptions = [sentence, ...(distractors || [])];
    return [...allOptions].sort(() => Math.random() - 0.5);
  }, [sentence, distractors]);

  const handleItemClick = useCallback((item: MaterialWorld) => {
    if (disabled || selectedItem) return;

    const isCorrect = item.id === sentence.id;
    if (!isCorrect) {
      playTryAgain();
    }
    onSelect(item, isCorrect);
  }, [disabled, selectedItem, sentence?.id, playTryAgain, onSelect]);

  if (!sentence || shuffledOptions.length === 0) {
    return null;
  }

  return (
    <div>
      {/* Speaker button to replay audio */}
      <div className="text-center mb-6">
        <motion.button
          onClick={playSentenceAudio}
          disabled={disabled}
          className="w-24 h-24 sm:w-32 sm:h-32 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-400 text-white rounded-full text-5xl sm:text-6xl transition-colors shadow-lg"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(147, 51, 234, 0.7)",
              "0 0 0 20px rgba(147, 51, 234, 0)",
            ],
          }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeOut",
          }}
        >
          🎧
        </motion.button>
      </div>

      {/* Picture grid */}
      <motion.div
        className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 max-w-7xl mx-auto"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {shuffledOptions.map((item) => {
          const isCorrect = item.id === sentence.id;
          const isSelected = selectedItem?.id === item.id;

          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item)}
              style={{ cursor: disabled ? 'default' : 'pointer' }}
              className={`
                w-full cursor-pointer border-2 sm:border-4 rounded-2xl flex items-center justify-center aspect-square
                ${disabled ? 'opacity-50' : ''}
                ${isSelected ? (isCorrect ? 'bg-green-400 border-green-600' : 'bg-red-400 border-red-600') : 'bg-white border-gray-300 hover:border-purple-400'}
              `}
            >
              <div className="w-full h-full flex items-center justify-center rounded-xl bg-gradient-to-br from-background to-muted/30 relative overflow-hidden">
                {/* Image with fallback */}
                <MaterialWorldImage item={item} disabled={disabled} selectedItem={selectedItem} />

                {/* Success overlay (green) or Error border (red) */}
                {isSelected && isCorrect && (
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center text-4xl font-bold bg-green-500/90 text-white"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    ✅
                  </motion.div>
                )}
                {isSelected && !isCorrect && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {/* Red border only */}
                    <div className="absolute inset-0 border-4 sm:border-8 border-red-500 rounded-xl" />
                    {/* X icon in corner */}
                    <div className="absolute top-1 right-1 sm:top-2 sm:right-2 text-2xl sm:text-3xl">
                      ❌
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          );
        })}
      </motion.div>

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
