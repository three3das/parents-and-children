import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { type GameType } from "@shared/schema";
import { useLanguage } from "@/lib/i18n";

interface HelpButtonProps {
  gameType: GameType;
}

// ⚠️ ПРАВКА: раньше кнопка была квадратной с одним символом "?" — теперь
// на ней текст "Правила игры" на текущем выбранном языке интерфейса
// (том же самом, что выбирается колесом "Языки" на IshvaraPage.tsx).
// Словарь RULES_LABEL — по тому же принципу, что и ALPHABET_LABEL в
// GameMenu.tsx/IshvaraPage.tsx: один короткий перевод фразы "правила
// игры" на каждый из 12 языков сайта. Сама функциональность кнопки
// (открытие модалки с инструкцией к текущей игре) не изменилась —
// поменялась только надпись на самой кнопке.
const RULES_LABEL: Record<string, string> = {
  sa: 'क्रीडा नियमाः',
  hi: 'खेल के नियम',
  en: 'Rules of the game',
  es: 'Reglas del juego',
  pt: 'Regras do jogo',
  fr: 'Règles du jeu',
  id: 'Aturan permainan',
  ru: 'Правила игры',
  uk: 'Правила гри',
  ar: 'قواعد اللعبة',
  ur: 'کھیل کے اصول',
  bn: 'খেলার নিয়ম',
};

export function HelpButton({ gameType }: HelpButtonProps) {
  const [showHelp, setShowHelp] = useState(false);
  const { t, language } = useLanguage();

  const rulesLabel = RULES_LABEL[language] ?? RULES_LABEL.en;

  const getInstructions = () => {
    if (gameType === 'picture-match') return t.instructions.pictureMatch;
    if (gameType === 'spell-word') return t.instructions.spellWord;
    if (gameType === 'syllables') return t.instructions.syllables;
    if (gameType === 'sentence-game') return t.instructions.sentences;
    if (gameType === 'audio-picture') return t.instructions.audioPicture;
    if (gameType === 'audio-sentence') return t.instructions.audioSentence;

    return t.instructions.default;
  };

  return (
    <>
      {/* Help Button — раньше квадратная кнопка с символом "?" на
          bg-blue-500 (синяя, выбивалась из золотой палитры). Теперь
          золотая гамма (как у остальных кнопок GameMenu) и вместо "?"
          — надпись "Правила игры" на текущем языке интерфейса. Ширина
          подстраивается под текст (px + whitespace-nowrap), высота
          осталась как раньше. */}
      <motion.button
        className="h-10 sm:h-16 px-3 sm:px-4 bg-amber-300 text-white rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg whitespace-nowrap text-[10px] sm:text-sm leading-tight flex items-center justify-center"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setShowHelp(!showHelp)}
      >
        {rulesLabel}
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
              <h3 className="text-xl font-bold mb-4 text-[#FFD700] font-bold">{t.howToPlay}</h3>
              <p className="text-[#FFD700] font-bold leading-relaxed mb-6">
                {getInstructions()}
              </p>
              <motion.button
                className="bg-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-amber-600 transition-colors"
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