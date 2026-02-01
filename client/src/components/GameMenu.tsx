import { motion } from "framer-motion";
import { type GameType } from "@shared/schema";
import { HelpButton } from "./HelpButton";

const GAME_ICONS: Record<GameType, string> = {
  'picture-match': '🖼️',
  'missing-letter': '🔍',
  'extra-letter': '🗑️',
  'spell-word': '✏️',
  'sentence-game': '📝',
  'syllables': '🧱',
  'mix': '🎲'
};

interface GameMenuProps {
  currentGameType: GameType;
  onGameTypeChange: (gameType: GameType) => void;
  currentMixType?: string;
}

export function GameMenu({ currentGameType, onGameTypeChange, currentMixType }: GameMenuProps) {
  const gameTypes: GameType[] = ['picture-match', 'missing-letter', 'extra-letter', 'spell-word', 'syllables', 'sentence-game', 'mix'];

  return (
    <div className="flex gap-1 sm:gap-2 mb-4 justify-between items-center">
      <div className="flex gap-0.5 sm:gap-2">
        {gameTypes.map((gameType) => (
          <motion.button
            key={gameType}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGameTypeChange(gameType)}
            className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl text-xl sm:text-3xl transition-colors flex items-center justify-center ${currentGameType === gameType
              ? 'bg-blue-500 text-white shadow-md'
              : 'bg-gray-100 hover:bg-gray-200'
              }`}
          >
            {GAME_ICONS[gameType]}
          </motion.button>
        ))}
      </div>

      <HelpButton
        gameType={currentGameType}
        currentMixType={currentMixType}
      />
    </div>
  );
}