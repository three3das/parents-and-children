import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";

interface GameTitleProps {
  gameType: string;
}

export function GameTitle({ gameType }: GameTitleProps) {
  const { t } = useLanguage();

  const getGameTitle = (type: string) => {
    switch (type) {
      case 'picture-match':
        return t.pictureMatch || 'Picture Match';
      case 'spell-word':
        return t.spellWord || 'Spell Word';
      case 'syllables':
        return t.syllables || 'Syllables';
      case 'sentence-game':
        return t.sentences || 'Sentences';
      case 'audio-picture':
        return t.audioPicture || 'Audio Picture';
      case 'audio-sentence':
        return t.audioSentence || 'Audio Sentence';
      default:
        return type;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-6"
    >
      <h1 className="text-3xl sm:text-4xl font-bold text-primary mb-2">
        {getGameTitle(gameType)}
      </h1>
      <p className="text-lg text-[#FFD700] font-bold">
        {t.gameInstructions || 'Complete the task below'}
      </p>
    </motion.div>
  );
}
