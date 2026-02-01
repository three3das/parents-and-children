import { motion } from "framer-motion";
import { getGameBySlug } from "@/lib/constants";

interface GameTitleProps {
  gameType: string;
  lang?: 'en' | 'ru' | 'uk';
}

export function GameTitle({ gameType, lang = 'ru' }: GameTitleProps) {
  const game = getGameBySlug(gameType);

  if (!game) return null;

  const handleSpeakerClick = () => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(game.instruction[lang]);
      utterance.lang = lang === 'ru' ? 'ru-RU' : lang === 'uk' ? 'uk-UA' : 'en-US';
      utterance.rate = 0.9;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-4"
    >
      <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2">
        <span className="text-2xl">{game.icon}</span>
        <span className="text-sm font-medium text-blue-800">{game.instruction[lang]}</span>
        <button
          onClick={handleSpeakerClick}
          className="text-gray-400 hover:text-gray-600 transition-colors ml-1"
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M11.5 3.5c.3-.2.7-.1.9.2l.1.2v16.2c0 .4-.3.7-.7.7-.1 0-.3 0-.4-.1l-4.6-3.4H3.5c-.4 0-.7-.3-.7-.7v-8.2c0-.4.3-.7.7-.7h3.3l4.7-4zm7.1 2.6c2.1 1.5 3.4 4 3.4 6.6s-1.3 5.1-3.4 6.6c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 1.7-1.2 2.8-3.2 2.8-5.5s-1.1-4.3-2.8-5.5c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1zm-2.8 2.8c1.2.9 2 2.3 2 3.8s-.8 2.9-2 3.8c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 .9-.6 1.4-1.6 1.4-2.7s-.5-2.1-1.4-2.7c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1z"/>
          </svg>
        </button>
      </div>
    </motion.div>
  );
}
