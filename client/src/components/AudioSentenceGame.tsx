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
  const { language, t } = useLanguage();

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

    return (sentence as any).event_ru || sentence.event || '';
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
      } else {
        console.warn('AudioSentenceGame: no audio file and no text to speak for this sentence.');
      }
    }
  }, [getAudioPath, getSentenceText, playCustomAudio, language]);

  // Audio will only play when headphones button is clicked

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

  // -----------------------------------------------------------------------
  // IMPORTANT: this component does not fetch its own data — it only renders
  // whatever `sentence` / `distractors` props it is given by its parent.
  //
  // Previously, when `sentence` was missing or `shuffledOptions` was empty,
  // this component silently rendered `null`. If the *parent* component was
  // meanwhile showing a "Loading..." placeholder while waiting for this
  // component to render something, the screen would appear stuck on
  // "Loading..." forever, even though the real problem was that the parent
  // never received valid `sentence`/`distractors` data in the first place
  // (e.g. no material-world entries matched, or the parent's own fetch
  // never resolved / errored silently).
  //
  // Rendering an explicit message here (instead of null) makes that failure
  // visible immediately, and makes it obvious that the fix belongs in the
  // parent component that supplies `sentence` and `distractors` — check
  // its data-loading logic (the equivalent of loadMaterialWorldActivities()
  // in SentenceGame.tsx) for the same "fetched OK but filtered down to
  // zero items" issue.
  // -----------------------------------------------------------------------
  if (!sentence || shuffledOptions.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="text-4xl mb-4">📭</div>
          <p className="text-xl">
            {t.noDataAvailable}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Speaker button to replay audio */}
      <div className="text-center mb-6">
        <motion.button
          onClick={playSentenceAudio}
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