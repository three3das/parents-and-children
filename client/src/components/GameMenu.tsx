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
  Eraser,
  Calculator,
  type LucideIcon,
} from "lucide-react";
import { ERASE_DRAWING_EVENT } from "./alphabet-tutor/constants";

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

// Подпись кнопки «Ластик» на десктопе — на языке интерфейса (по тому же
// принципу, что RULES_LABEL в HelpButton.tsx).
const ERASER_LABEL: Record<string, string> = {
  sa: 'मार्जनी',
  hi: 'रबर',
  en: 'Eraser',
  es: 'Borrador',
  pt: 'Borracha',
  fr: 'Gomme',
  id: 'Penghapus',
  ru: 'Ластик',
  uk: 'Гумка',
  ar: 'ممحاة',
  ur: 'ربڑ',
  bn: 'রাবার',
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
  const eraserLabel = ERASER_LABEL[language] ?? ERASER_LABEL.en;

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
        {/* «Ластик» (только десктоп, sm+ и только в алфавите): слева от
            «Правил игры», размеры и стиль — те же, что у HelpButton.
            На мобильном есть своя иконка-стиралка ниже. */}
        {currentGameType === 'alphabet-placeholder' && (
          <motion.button
            type="button"
            title={eraserLabel}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => window.dispatchEvent(new Event(ERASE_DRAWING_EVENT))}
            className="hidden sm:flex sm:w-auto sm:h-16 sm:px-4 bg-amber-300 text-white rounded-xl font-bold hover:bg-amber-400 transition-colors shadow-lg text-center sm:whitespace-nowrap sm:text-sm leading-tight items-center justify-center"
          >
            {eraserLabel}
          </motion.button>
        )}
        <HelpButton gameType={currentGameType} />
      </div>

      {/* Стиралка (только мобильная версия и только в алфавите, где есть
          холст): ряд 2, та же 7-я колонка — ровно под «Правилами игры»,
          та же ширина. Кнопки 8–12 займут колонки 2–6 этого же ряда.
          Очищает холст DrawingPad через событие. */}
      {currentGameType === 'alphabet-placeholder' && (
        <motion.button
          type="button"
          aria-label="Стереть рисунок"
          title="Стереть рисунок"
          style={{ gridRow: 2, gridColumn: HELP_COLUMN }}
          whileTap={{ scale: 0.95 }}
          onClick={() => window.dispatchEvent(new Event(ERASE_DRAWING_EVENT))}
          className="sm:hidden w-full min-h-10 rounded-xl bg-amber-300 hover:bg-amber-400 transition-colors shadow-lg flex items-center justify-center text-white"
        >
          <Eraser className="w-5 h-5" strokeWidth={2.5} />
        </motion.button>
      )}
    </div>
  );
}