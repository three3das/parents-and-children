import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type GameType } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

interface HelpButtonProps {
  gameType: GameType;
  currentMixType?: string;
}

export function HelpButton({ gameType, currentMixType }: HelpButtonProps) {
  const [showHelp, setShowHelp] = useState(false);
  const { t } = useLanguage();

  const getInstructions = () => {
    if (gameType === 'mix' && currentMixType) {
      if (currentMixType === 'picture-match') return t.instructions.pictureMatch;
      if (currentMixType === 'missing-letter') return t.instructions.missingLetter;
      if (currentMixType === 'extra-letter') return t.instructions.extraLetter;
      if (currentMixType === 'spell-word') return t.instructions.spellWord;
      return t.instructions.mix;
    }

    if (gameType === 'picture-match') return t.instructions.pictureMatch;
    if (gameType === 'missing-letter') return t.instructions.missingLetter;
    if (gameType === 'extra-letter') return t.instructions.extraLetter;
    if (gameType === 'spell-word') return t.instructions.spellWord;
    if (gameType === 'syllables') return t.instructions.syllables;
    if (gameType === 'sentence-game') return t.instructions.sentences;
    if (gameType === 'audio-picture') return t.instructions.audioPicture;
    if (gameType === 'mix') return t.instructions.mix;

    return t.instructions.default;
  };

  return (
    <>
      {/* Help Button */}
      <motion.button
        className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-500 text-white rounded-xl text-lg sm:text-xl font-bold hover:bg-blue-600 transition-colors shadow-lg"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowHelp(!showHelp)}
      >
        ?
      </motion.button>

      {/* Help Overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
            onClick={() => setShowHelp(false)}
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              className="bg-white rounded-xl p-8 max-w-md mx-4 text-center shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="text-4xl mb-4">💡</div>
              <h3 className="text-xl font-bold mb-4 text-gray-800">{t.howToPlay}</h3>
              <p className="text-gray-700 leading-relaxed mb-6">
                {getInstructions()}
              </p>
              <motion.button
                className="bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-600 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowHelp(false)}
              >
                {t.gotIt}
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
