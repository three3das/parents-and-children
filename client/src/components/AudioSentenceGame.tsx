import { useEffect, useCallback, useMemo } from "react";
import { motion } from "framer-motion";
import { type MaterialWorld } from "@shared/schema";
import { useAudio } from "@/hooks/useAudio";
import { useLanguage } from "@/lib/i18n";
import { getImagePath, extractEmojiFromImage } from "@/lib/utils";
import { GameImageCard } from "@/components/shared/GameImageCard";
import { GameImageGrid } from "@/components/shared/GameImageGrid";

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

    if (language === 'ru' && (sentence as any).audio_ru) {
      return (sentence as any).audio_ru;
    } else if (language === 'en' && (sentence as any).audio_en) {
      return (sentence as any).audio_en;
    } else if (language === 'uk' && (sentence as any).audio_uk) {
      return (sentence as any).audio_uk;
    }

    return null;
  }, [sentence?.id, sentence, language]);

  // Get the sentence text based on selected language
  const getSentenceText = useCallback(() => {
    if (!sentence) return '';

    if (language === 'en' && (sentence as any).event_en) {
      return (sentence as any).event_en;
    } else if (language === 'uk' && (sentence as any).event_uk) {
      return (sentence as any).event_uk;
    }

    return sentence.event;
  }, [sentence, language]);

  // Play audio using file or speech synthesis as fallback
  const playSentenceAudio = useCallback(() => {
    const audioPath = getAudioPath();

    if (audioPath) {
      console.log('Playing sentence audio file:', audioPath);
      playCustomAudio(audioPath);
    } else {
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
      <GameImageGrid itemCount={shuffledOptions.length}>
        {shuffledOptions.map((item) => {
          const isCorrect = item.id === sentence.id;
          const isSelected = selectedItem?.id === item.id;
          const imagePath = getImagePath(item.image);
          const emoji = extractEmojiFromImage(item.image);

          return (
            <GameImageCard
              key={item.id}
              imagePath={imagePath}
              emoji={emoji}
              altText={item.event}
              isSelected={!!isSelected}
              isCorrect={isCorrect}
              isDisabled={!!disabled || !!selectedItem}
              onClick={() => handleItemClick(item)}
            />
          );
        })}
      </GameImageGrid>

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
