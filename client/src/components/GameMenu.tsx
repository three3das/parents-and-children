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
  Calculator,
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
  'calculator': Calculator,
};

// Единый цвет для всех 7 кнопок: чистое золото #FFD700.
const GAME_BUTTON_COLOR = 'bg-[#FFD700] hover:bg-[#E6C200]';

// Мобильная (< sm) раскладка: сетка из 6 колонок для кнопок режимов + 7-я
// колонка под «Правила игры» (ряд 1) и стиралку (ряд 2). Слот режима с
// индексом i стоит в ряду floor(i / 6) + 1, колонке i % 6 + 1 — поэтому
// кнопки 7–12 всегда строго под кнопками 1–6, а новые режимы, добавленные
// в gameTypes, сами встают во 2-й ряд справа от «аудио-фразы».
// На sm и выше сетка не используется (там обычный flex-ряд, как раньше).
const MOBILE_COLUMNS = 6;
// Явные слоты: «Калькулятор» — 12-й (ряд 2, колонка 6), как 12-й сектор
// колеса «Игры»; слоты 8–11 пока свободны.
const FIXED_SLOT: Partial<Record<GameType, number>> = { calculator: 11 };
const mobileSlot = (gameType: GameType, index: number) => {
  const slot = FIXED_SLOT[gameType] ?? index;
  return {
    gridRow: Math.floor(slot / MOBILE_COLUMNS) + 1,
    gridColumn: (slot % MOBILE_COLUMNS) + 1,
  };
};
const HELP_COLUMN = MOBILE_COLUMNS + 1;

interface GameMenuProps {
  currentGameType: GameType;
  onGameTypeChange: (gameType: GameType) => void;
}

export function GameMenu({ currentGameType, onGameTypeChange }: GameMenuProps) {
  const { language } = useLanguage();
  const alphabetLetter = FIRST_LETTER[language] ?? 'A';
  const alphabetLabel = ALPHABET_LABEL[language] ?? 'Alphabet';

  const gameTypes: GameType[] = [
    'alphabet-placeholder',
    'picture-match',
    'spell-word',
    'syllables',
    'sentence-game',
    'audio-picture',
    'audio-sentence',
    'calculator',
  ];

  return (
    <div className="grid grid-cols-[repeat(6,minmax(0,1fr))_4.5rem] gap-1 sm:flex sm:gap-2 mb-1 sm:mb-4 sm:justify-between sm:items-center w-full font-montserrat">
      {/* contents на мобильном: кнопки становятся ячейками общей сетки;
          sm и выше: прежний flex-ряд. */}
      <div className="contents sm:flex sm:gap-2 sm:flex-1 sm:min-w-0">
        {gameTypes.map((gameType, index) => {
          const Icon = GAME_ICONS[gameType];
          return (
            <motion.button
              key={gameType}
              style={mobileSlot(gameType, index)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onGameTypeChange(gameType)}
              className={`min-w-0 aspect-square sm:flex-none sm:w-16 sm:h-16 rounded-xl transition-colors flex flex-col items-center justify-center shadow-md text-black ${
                currentGameType === gameType
                  ? 'ring-4 ring-[#8B6B00]'
                  : ''
              } ${GAME_BUTTON_COLOR}`}
            >
              {gameType === 'alphabet-placeholder' ? (
                <>
                  <span className="text-base sm:text-3xl font-black leading-none text-black">
                    {alphabetLetter}
                  </span>
                  <span className="text-[6px] sm:text-[12px] font-black leading-none mt-0.5 sm:mt-1 opacity-90 max-w-full truncate px-0.5 text-black">
                    {alphabetLabel}
                  </span>
                </>
              ) : Icon ? (
                <Icon className="w-4 h-4 sm:w-8 sm:h-8 text-black" strokeWidth={4} />
              ) : null}
            </motion.button>
          );
        })}
      </div>

      {/* «Правила игры»: ряд 1, 7-я колонка (на sm+ — справа в flex-ряду). */}
      <div className="flex sm:gap-2" style={{ gridRow: 1, gridColumn: HELP_COLUMN }}>
        <HelpButton gameType={currentGameType} />
      </div>
    </div>
  );
}