import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import { SANSKRIT_VOWELS, SANSKRIT_CONSONANTS, SANSKRIT_SPECIAL, ALPHABET_CATEGORIES, type SanskritLetter } from "@/lib/sanskritAlphabet";
import {
  RUSSIAN_VOWELS,
  RUSSIAN_CONSONANTS,
  RUSSIAN_SPECIAL,
  UKRAINIAN_VOWELS,
  UKRAINIAN_CONSONANTS,
  UKRAINIAN_SPECIAL,
  ENGLISH_VOWELS,
  ENGLISH_CONSONANTS,
  CYRILLIC_CATEGORIES,
  ENGLISH_CATEGORIES,
  type Letter
} from "@/lib/cyrillicAlphabet";

type DisplayMode = 'basic' | 'detailed';
type AlphabetLetter = SanskritLetter | Letter;

export function AlphabetTutor() {
  const { language } = useLanguage();
  const [displayMode, setDisplayMode] = useState<DisplayMode>('detailed');
  const [showTooltip, setShowTooltip] = useState(false);
  const [autoAudio, setAutoAudio] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

  // Get alphabet data based on current language
  const getAlphabetData = () => {
    switch (language) {
      case 'sa':
        return {
          vowels: SANSKRIT_VOWELS,
          consonants: SANSKRIT_CONSONANTS,
          special: SANSKRIT_SPECIAL,
          categories: ALPHABET_CATEGORIES,
          title: 'Sanskrit Alphabet (Devanagari)',
          vowelsTitle: 'Vowels (Swaras)',
          consonantsTitle: 'Consonants (Vyanjanas)',
          specialTitle: 'Special Characters',
          audioPath: '/audio/sanskrit/'
        };
      case 'ru':
        return {
          vowels: RUSSIAN_VOWELS,
          consonants: RUSSIAN_CONSONANTS,
          special: RUSSIAN_SPECIAL,
          categories: CYRILLIC_CATEGORIES,
          title: 'Русский алфавит',
          vowelsTitle: 'Гласные',
          consonantsTitle: 'Согласные',
          specialTitle: 'Специальные знаки',
          audioPath: '/audio/russian/'
        };
      case 'uk':
        return {
          vowels: UKRAINIAN_VOWELS,
          consonants: UKRAINIAN_CONSONANTS,
          special: UKRAINIAN_SPECIAL,
          categories: CYRILLIC_CATEGORIES,
          title: 'Український алфавіт',
          vowelsTitle: 'Голосні',
          consonantsTitle: 'Приголосні',
          specialTitle: 'Спеціальні знаки',
          audioPath: '/audio/ukrainian/'
        };
      case 'en':
        return {
          vowels: ENGLISH_VOWELS,
          consonants: ENGLISH_CONSONANTS,
          special: [],
          categories: ENGLISH_CATEGORIES,
          title: 'English Alphabet',
          vowelsTitle: 'Vowels',
          consonantsTitle: 'Consonants',
          specialTitle: 'Special Characters',
          audioPath: '/audio/english/'
        };
      default:
        return {
          vowels: SANSKRIT_VOWELS,
          consonants: SANSKRIT_CONSONANTS,
          special: SANSKRIT_SPECIAL,
          categories: ALPHABET_CATEGORIES,
          title: 'Sanskrit Alphabet (Devanagari)',
          vowelsTitle: 'Vowels (Swaras)',
          consonantsTitle: 'Consonants (Vyanjanas)',
          specialTitle: 'Special Characters',
          audioPath: '/audio/sanskrit/'
        };
    }
  };

  const alphabetData = getAlphabetData();
  const allLetters = [...alphabetData.vowels, ...alphabetData.consonants, ...alphabetData.special];

  const isLetterHighlighted = (letter: AlphabetLetter) => {
    if (!activeCategory) return false;
    const category = alphabetData.categories.find(c => c.id === activeCategory);
    if (!category) return false;
    return category.filter.some(f => letter.category.includes(f));
  };

  const handleLetterClick = (letter: AlphabetLetter) => {
    setSelectedLetter(letter);
    if (autoAudio && letter.audioFile) {
      const audio = new Audio(`${alphabetData.audioPath}${letter.audioFile}`);
      audio.play().catch(() => {});
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setActiveCategory(activeCategory === categoryId ? null : categoryId);
  };

  const getLetterDisplay = (letter: AlphabetLetter) => {
    if ('devanagari' in letter) {
      return {
        main: letter.transliteration,
        hover: letter.devanagari,
        detail: letter.devanagari
      };
    } else {
      return {
        main: letter.character,
        hover: letter.name,
        detail: letter.character
      };
    }
  };

  // Group categories for Sanskrit
  const vowelCategories = language === 'sa'
    ? alphabetData.categories.filter(c => 'group' in c && c.group === 'vowels')
    : [];
  const consonantCategories = language === 'sa'
    ? alphabetData.categories.filter(c => 'group' in c && c.group === 'consonants')
    : [];
  const characteristicCategories = language === 'sa'
    ? alphabetData.categories.filter(c => 'group' in c && c.group === 'characteristics')
    : [];

  return (
    <div className="max-w-7xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-4 text-center">{alphabetData.title}</h2>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap gap-4 items-center bg-white p-4 rounded-lg shadow">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">Display:</span>
          <button
            onClick={() => setDisplayMode('basic')}
            className={`px-3 py-1 rounded ${displayMode === 'basic' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Basic
          </button>
          <button
            onClick={() => setDisplayMode('detailed')}
            className={`px-3 py-1 rounded ${displayMode === 'detailed' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Detailed
          </button>
        </div>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={showTooltip}
            onChange={(e) => setShowTooltip(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">On hover: Tooltip</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoAudio}
            onChange={(e) => setAutoAudio(e.target.checked)}
            className="w-4 h-4"
          />
          <span className="text-sm">Auto audio</span>
        </label>
      </div>

      <div className="flex gap-6">
        {/* Alphabet Table */}
        <div className="flex-1">
          {/* Vowels */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{alphabetData.vowelsTitle}</h3>
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {alphabetData.vowels.map((letter) => (
                <LetterCard
                  key={getLetterDisplay(letter).main}
                  letter={letter}
                  display={getLetterDisplay(letter)}
                  isHighlighted={isLetterHighlighted(letter)}
                  isSelected={selectedLetter && getLetterDisplay(selectedLetter).main === getLetterDisplay(letter).main}
                  displayMode={displayMode}
                  showTooltip={showTooltip}
                  isHovered={hoveredLetter === getLetterDisplay(letter).main}
                  onClick={() => handleLetterClick(letter)}
                  onMouseEnter={() => setHoveredLetter(getLetterDisplay(letter).main)}
                  onMouseLeave={() => setHoveredLetter(null)}
                />
              ))}
            </div>
          </div>

          {/* Consonants */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-3">{alphabetData.consonantsTitle}</h3>
            <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
              {alphabetData.consonants.map((letter) => (
                <LetterCard
                  key={getLetterDisplay(letter).main}
                  letter={letter}
                  display={getLetterDisplay(letter)}
                  isHighlighted={isLetterHighlighted(letter)}
                  isSelected={selectedLetter && getLetterDisplay(selectedLetter).main === getLetterDisplay(letter).main}
                  displayMode={displayMode}
                  showTooltip={showTooltip}
                  isHovered={hoveredLetter === getLetterDisplay(letter).main}
                  onClick={() => handleLetterClick(letter)}
                  onMouseEnter={() => setHoveredLetter(getLetterDisplay(letter).main)}
                  onMouseLeave={() => setHoveredLetter(null)}
                />
              ))}
            </div>
          </div>

          {/* Special Characters */}
          {alphabetData.special.length > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">{alphabetData.specialTitle}</h3>
              <div className="grid grid-cols-5 sm:grid-cols-7 gap-2">
                {alphabetData.special.map((letter) => (
                  <LetterCard
                    key={getLetterDisplay(letter).main}
                    letter={letter}
                    display={getLetterDisplay(letter)}
                    isHighlighted={isLetterHighlighted(letter)}
                    isSelected={selectedLetter && getLetterDisplay(selectedLetter).main === getLetterDisplay(letter).main}
                    displayMode={displayMode}
                    showTooltip={showTooltip}
                    isHovered={hoveredLetter === getLetterDisplay(letter).main}
                    onClick={() => handleLetterClick(letter)}
                    onMouseEnter={() => setHoveredLetter(getLetterDisplay(letter).main)}
                    onMouseLeave={() => setHoveredLetter(null)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Category Buttons */}
          <div className="space-y-3">
            {language === 'sa' ? (
              <>
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-600">Vowels:</h4>
                  <div className="flex flex-wrap gap-2">
                    {vowelCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          activeCategory === category.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-600">Consonants:</h4>
                  <div className="flex flex-wrap gap-2">
                    {consonantCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          activeCategory === category.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-semibold mb-2 text-gray-600">Characteristics:</h4>
                  <div className="flex flex-wrap gap-2">
                    {characteristicCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`px-3 py-1 rounded text-sm ${
                          activeCategory === category.id
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 hover:bg-gray-300'
                        }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-wrap gap-2">
                {alphabetData.categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => handleCategoryClick(category.id)}
                    className={`px-3 py-1 rounded text-sm ${
                      activeCategory === category.id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 hover:bg-gray-300'
                    }`}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Detail Panel */}
        {selectedLetter && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="w-80 bg-white p-6 rounded-lg shadow-lg sticky top-4 h-fit"
          >
            <div className="text-center mb-4">
              <div className="text-6xl mb-2">{getLetterDisplay(selectedLetter).detail}</div>
              <div className="text-2xl text-gray-600 mb-2">
                {'devanagari' in selectedLetter
                  ? selectedLetter.transliteration
                  : selectedLetter.name}
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Pronunciation:</h4>
                <p className="text-sm">{selectedLetter.pronunciation}</p>
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-600 mb-1">Categories:</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedLetter.category.map((cat) => (
                    <span key={cat} className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded">
                      {cat}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

interface LetterCardProps {
  letter: AlphabetLetter;
  display: { main: string; hover: string; detail: string };
  isHighlighted: boolean;
  isSelected: boolean;
  displayMode: DisplayMode;
  showTooltip: boolean;
  isHovered: boolean;
  onClick: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function LetterCard({
  letter,
  display,
  isHighlighted,
  isSelected,
  displayMode,
  showTooltip,
  isHovered,
  onClick,
  onMouseEnter,
  onMouseLeave,
}: LetterCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative aspect-square rounded-lg border-2 flex flex-col items-center justify-center p-2 transition-colors ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : isHighlighted
          ? 'border-yellow-400 bg-yellow-50'
          : 'border-gray-300 bg-white hover:bg-gray-50'
      }`}
    >
      <div className="text-2xl font-semibold">
        {isHovered ? display.hover : display.main}
      </div>
      {displayMode === 'detailed' && !isHovered && (
        <div className="text-xs text-gray-500 mt-1">{display.detail}</div>
      )}

      {showTooltip && isHovered && (
        <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {letter.pronunciation}
        </div>
      )}
    </motion.button>
  );
}
