import { motion } from "framer-motion";
import { type GameType } from "@shared/schema";
import { HelpButton } from "./HelpButton";
import { GAMES } from "@/lib/constants";

interface GameMenuProps {
  currentGameType: GameType;
  onGameTypeChange: (gameType: GameType) => void;
}

export function GameMenu({ currentGameType, onGameTypeChange }: GameMenuProps) {
  return (
    <div className="flex gap-1 sm:gap-2 mb-4 justify-between items-center">
      <div className="flex gap-0.5 sm:gap-2">
        {GAMES.map((game) => (
          <motion.button
            key={game.slug}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGameTypeChange(game.slug as GameType)}
            className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl text-xl sm:text-3xl transition-colors flex items-center justify-center ${currentGameType === game.slug
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            {game.icon}
          </motion.button>
        ))}
      </div>

      <HelpButton gameType={currentGameType} />
    </div>
  );
}
