import { motion } from "framer-motion";
import { type GameType } from "@shared/schema";
import { HelpButton } from "./HelpButton";

const GAME_ICONS: Record<GameType, string> = {
  'alphabet-placeholder': '🔤',
  'picture-match': '🖼️',
  'spell-word': '✏️',
  'sentence-game': '📝',
  'syllables': '🧱',
  'audio-picture': '🔊',
  'audio-sentence': '🎧'
};

const GAME_COLORS: Record<GameType, string> = {
  'alphabet-placeholder': 'bg-red-400 hover:bg-red-500',
  'picture-match': 'bg-orange-400 hover:bg-orange-500',
  'spell-word': 'bg-yellow-400 hover:bg-yellow-500',
  'syllables': 'bg-green-400 hover:bg-green-500',
  'sentence-game': 'bg-blue-400 hover:bg-blue-500',
  'audio-picture': 'bg-indigo-400 hover:bg-indigo-500',
  'audio-sentence': 'bg-purple-400 hover:bg-purple-500'
};

interface GameMenuProps {
  currentGameType: GameType;
  onGameTypeChange: (gameType: GameType) => void;
}

export function GameMenu({ currentGameType, onGameTypeChange }: GameMenuProps) {
  const gameTypes: GameType[] = ['alphabet-placeholder', 'picture-match', 'spell-word', 'syllables', 'sentence-game', 'audio-picture', 'audio-sentence'];

  return (
    <div className="flex gap-1 sm:gap-2 mb-4 justify-between items-center">
      <div className="flex gap-0.5 sm:gap-2">
        {gameTypes.map((gameType) => (
          <motion.button
            key={gameType}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onGameTypeChange(gameType)}
            className={`w-10 h-10 sm:w-16 sm:h-16 rounded-xl text-xl sm:text-3xl transition-colors flex items-center justify-center shadow-md ${
              currentGameType === gameType
                ? 'ring-4 ring-red-500'
                : ''
            } ${GAME_COLORS[gameType]}`}
          >
            {GAME_ICONS[gameType]}
          </motion.button>
        ))}
      </div>

      <HelpButton
        gameType={currentGameType}
      />
    </div>
  );
}