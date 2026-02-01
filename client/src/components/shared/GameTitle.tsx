import { motion } from "framer-motion";
import { getGameBySlug } from "@/lib/constants";

interface GameTitleProps {
  gameType: string;
  lang?: 'en' | 'ru' | 'uk';
}

export function GameTitle({ gameType, lang = 'ru' }: GameTitleProps) {
  const game = getGameBySlug(gameType);

  if (!game) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center mb-4"
    >
      <div className="inline-flex items-center gap-2 bg-blue-100 rounded-full px-4 py-2">
        <span className="text-2xl">{game.icon}</span>
        <span className="text-sm font-medium text-blue-800">{game.name[lang]}</span>
      </div>
    </motion.div>
  );
}
