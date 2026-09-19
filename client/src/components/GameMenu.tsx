import { motion } from "framer-motion";
import { type GameType } from "@shared/schema";
import { HelpButton } from "./HelpButton";
import { useLanguage } from "@/lib/i18n";
import {
  Image,
  PenLine,
  Blocks,
  NotebookPen,
  Volume2,
  Headphones,
  type LucideIcon,
} from "lucide-react";

const FIRST_LETTER: Record<string, string> = {
  sa: 'अ',
  hi: 'अ',
  en: 'A',
  es: 'A',
  pt: 'A',
  fr: 'A',
  id: 'A',
  ru: 'А',
  uk: 'А',
  ar: 'ا',
  ur: 'ا',
  bn: 'অ',
};

const ALPHABET_LABEL: Record<string, string> = {
  sa: 'वर्णमाला',
  hi: 'वर्णमाला',
  en: 'Alphabet',
  es: 'Alfabeto',
  pt: 'Alfabeto',
  fr: 'Alphabet',
  id: 'Alfabet',
  ru: 'Алфавит',
  uk: 'Алфавіт',
  ar: 'الأبجدية',
  ur: 'حروف تہجی',
  bn: 'বর্ণমালা',
};

const GAME_ICONS: Partial<Record<GameType, LucideIcon>> = {
  'picture-match': Image,
  'spell-word': PenLine,
  'sentence-game': NotebookPen,
  'syllables': Blocks,
  'audio-picture': Volume2,
  'audio-sentence': Headphones,
};

// Единый цвет для всех 7 кнопок: чистое золото #FFD700.
const GAME_BUTTON_COLOR = 'bg-[#FFD700] hover:bg-[#E6C200]';

interface GameMenuProps {
  currentGameType: GameType;
  onGameTypeChange: (gameType: GameType) => void;
}

export function GameMenu({ currentGameType, onGameTypeChange }: GameMenuProps) {
  const { language } = useLanguage();
  const alphabetLetter = FIRST_LETTER[language] ?? 'A';
  const alphabetLabel = ALPHABET_LABEL[language] ?? 'Alphabet';

  const gameTypes: GameType[] = ['alphabet-placeholder', 'picture-match', 'spell-word', 'syllables', 'sentence-game', 'audio-picture', 'audio-sentence'];

  return (
    // ⚠️ ПРАВКА (адаптивная вёрстка / мобильные устройства): добавлен
    // w-full, чтобы ряд занимал всю доступную ширину и flex-расчёты
    // ниже были корректными.
    <div className="flex gap-1 sm:gap-2 mb-4 justify-between items-center w-full">
      {/* ⚠️ ПРАВКА: добавлены flex-1 и min-w-0 — обёртка кнопок теперь
          сама забирает всё доступное пространство (за вычетом
          HelpButton), а кнопки внутри неё делят эту ширину поровну на
          мобильном, вместо того чтобы иметь фиксированную ширину и
          вылезать за края экрана. */}
      <div className="flex gap-0.5 sm:gap-2 flex-1 min-w-0">
        {gameTypes.map((gameType) => {
          const Icon = GAME_ICONS[gameType];
          return (
            <motion.button
              key={gameType}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onGameTypeChange(gameType)}
              // ⚠️ ПРАВКА: на мобильном кнопка больше не имеет
              // фиксированной ширины (было w-10 h-10) — вместо этого
              // flex-1 + min-w-0 + aspect-square: кнопка растягивается
              // и делит ширину строки поровну с остальными 6 кнопками,
              // оставаясь квадратной. На sm: и выше — исходный
              // фиксированный размер 64×64 (sm:w-16 sm:h-16 sm:flex-none).
              className={`flex-1 min-w-0 aspect-square sm:flex-none sm:w-16 sm:h-16 rounded-xl transition-colors flex flex-col items-center justify-center shadow-md text-white ${
                currentGameType === gameType
                  ? 'ring-4 ring-[#8B6B00]'
                  : ''
              } ${GAME_BUTTON_COLOR}`}
            >
              {gameType === 'alphabet-placeholder' ? (
                <>
                  {/* ⚠️ ПРАВКА: текст/буква на мобильном чуть уменьшены
                      (text-lg → text-base) по запросу "немного уменьшите
                      кнопки". На sm: и выше размер не менялся. */}
                  <span className="text-base sm:text-3xl font-bold leading-none">
                    {alphabetLetter}
                  </span>
                  <span className="text-[6px] sm:text-[9px] font-semibold leading-none mt-0.5 sm:mt-1 opacity-90 max-w-full truncate px-0.5">
                    {alphabetLabel}
                  </span>
                </>
              ) : Icon ? (
                // ⚠️ ПРАВКА: иконка на мобильном чуть уменьшена
                // (w-5 h-5 → w-4 h-4).
                <Icon className="w-4 h-4 sm:w-8 sm:h-8" strokeWidth={2.25} />
              ) : null}
            </motion.button>
          );
        })}
      </div>

      <HelpButton
        gameType={currentGameType}
      />
    </div>
  );
}