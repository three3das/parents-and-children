import { useState } from "react";
import { motion } from "framer-motion";
import { useLanguage } from "@/lib/i18n";
import {
  SANSKRIT_VOWELS,
  GUTTURALS,
  PALATALS,
  RETROFLEXES,
  DENTALS,
  LABIALS,
  SEMIVOWELS,
  SIBILANTS,
  ASPIRATE,
  SANSKRIT_SPECIAL,
  ALPHABET_CATEGORIES,
  type SanskritLetter
} from "@/lib/sanskritAlphabet";
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
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedLetter, setSelectedLetter] = useState<AlphabetLetter | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [hoveredLetter, setHoveredLetter] = useState<string | null>(null);

  // Get alphabet data based on current language
  const getAlphabetData = () => {
    switch (language) {
      case 'sa':
        return {
          vowels: SANSKRIT_VOWELS,
          consonantGroups: [
            { title: 'Gutturals (Velar)', letters: GUTTURALS },
            { title: 'Palatals', letters: PALATALS },
            { title: 'Retroflexes (Cerebral)', letters: RETROFLEXES },
            { title: 'Dentals', letters: DENTALS },
            { title: 'Labials', letters: LABIALS },
            { title: 'Semivowels', letters: SEMIVOWELS },
            { title: 'Sibilants', letters: SIBILANTS },
            { title: 'Aspirate', letters: ASPIRATE }
          ],
          special: SANSKRIT_SPECIAL,
          categories: ALPHABET_CATEGORIES,
          title: 'Sanskrit Alphabet (Devanagari) - 50 letters',
          vowelsTitle: 'Vowels (Swaras) - 13 letters',
          consonantsTitle: 'Consonants (Vyanjanas) - 33 letters',
          specialTitle: 'Special Characters - 4 letters',
          audioPath: '/audio/letters/sanscrit/',
          useGroups: true
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
          audioPath: '/audio/letters/рос/',
          useGroups: false
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
          audioPath: '/audio/letters/укр/',
          useGroups: false
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
          audioPath: '/audio/letters/en/',
          useGroups: false
        };
      default:
        return {
          vowels: SANSKRIT_VOWELS,
          consonantGroups: [
            { title: 'Gutturals (Velar)', letters: GUTTURALS },
            { title: 'Palatals', letters: PALATALS },
            { title: 'Retroflexes (Cerebral)', letters: RETROFLEXES },
            { title: 'Dentals', letters: DENTALS },
            { title: 'Labials', letters: LABIALS },
            { title: 'Semivowels', letters: SEMIVOWELS },
            { title: 'Sibilants', letters: SIBILANTS },
            { title: 'Aspirate', letters: ASPIRATE }
          ],
          special: SANSKRIT_SPECIAL,
          categories: ALPHABET_CATEGORIES,
          title: 'Sanskrit Alphabet (Devanagari) - 50 letters',
          vowelsTitle: 'Vowels (Swaras) - 13 letters',
          consonantsTitle: 'Consonants (Vyanjanas) - 33 letters',
          specialTitle: 'Special Characters - 4 letters',
          audioPath: '/audio/letters/sanscrit/',
          useGroups: true
        };
    }
  };

  const alphabetData = getAlphabetData();

  // Get all letters for filtering
  const allLetters = alphabetData.useGroups
    ? [...alphabetData.vowels, ...alphabetData.consonantGroups!.flatMap(g => g.letters), ...alphabetData.special]
    : [...alphabetData.vowels, ...alphabetData.consonants!, ...alphabetData.special];

  const isLetterHighlighted = (letter: AlphabetLetter) => {
    if (!activeCategory) return false;
    const category = alphabetData.categories.find(c => c.id === activeCategory);
    if (!category) return false;
    return category.filter.some(f => letter.category.includes(f));
  };

  const handleLetterClick = (letter: AlphabetLetter) => {
    setSelectedLetter(letter);
    if (audioEnabled && letter.audioFile) {
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
        main: letter.devanagari,
        hover: letter.devanagari,
        detail: letter.transliteration
      };
    } else {
      return {
        main: letter.character,
        hover: letter.name,
        detail: letter.character
      };
    }
  };

  // Group categories based on language
  const getCategoriesByLanguage = () => {
    if (language === 'sa') {
      return {
        vowelCategories: alphabetData.categories.filter(c => 'group' in c && c.group === 'vowels'),
        consonantCategories: alphabetData.categories.filter(c => 'group' in c && c.group === 'consonants'),
        characteristicCategories: alphabetData.categories.filter(c => 'group' in c && c.group === 'characteristics')
      };
    } else {
      // For Russian, Ukrainian, and English - simple categories
      return {
        simpleCategories: alphabetData.categories
      };
    }
  };

  const categories = getCategoriesByLanguage();

  return (
    <div className="max-w-7xl mx-auto p-4">
      <div className="flex gap-4">
        {/* Left side - Function controls */}
        <div className="w-40 space-y-2">
          <div>
            <h4 className="text-[10px] text-[#FFD700] font-bold mb-1">
              {language === 'ru' ? 'Функции' : language === 'uk' ? 'Функції' : language === 'en' ? 'Functions' : 'Функции'}
            </h4>
            <div className="space-y-0.5">
              <button
                onClick={() => setAudioEnabled(!audioEnabled)}
                className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${ audioEnabled ? 'bg-green-400 text-[#FFD700] font-bold ' : 'bg-gray-200 text-[#FFD700] font-bold hover:bg-gray-300' }`}
              >
                🔊 {language === 'ru' ? 'Озвучивание' : language === 'uk' ? 'Озвучування' : language === 'en' ? 'Audio' : 'Озвучивание'}
              </button>
            </div>
          </div>
        </div>

        {/* Center - Alphabet Table */}
        <div className="flex-1">
          <div className="bg-gray-200 p-3 rounded">
            {language === 'sa' ? (
              // Sanskrit alphabet in grid format matching the screenshot
              <div className="space-y-0.5">
                {/* Row 1: Vowels (13 letters) */}
                <div className="flex gap-0.5 justify-start">
                  {alphabetData.vowels.map((letter, index) => (
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
                      number={index + 1}
                    />
                  ))}
                </div>

                {/* Rows 2-9: Consonants (8 rows of 5 letters each) */}
                {alphabetData.consonantGroups!.map((group, groupIndex) => (
                  <div key={groupIndex} className="flex gap-0.5 justify-start">
                    {group.letters.map((letter, letterIndex) => {
                      const consonantNumber = alphabetData.vowels.length +
                        alphabetData.consonantGroups!.slice(0, groupIndex).reduce((sum, g) => sum + g.letters.length, 0) +
                        letterIndex + 1;
                      return (
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
                          number={consonantNumber}
                        />
                      );
                    })}
                  </div>
                ))}

                {/* Row 10: Special characters (4 letters) */}
                <div className="flex gap-0.5 justify-start">
                  {alphabetData.special.map((letter, index) => (
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
                      number={alphabetData.vowels.length + 33 + index + 1}
                    />
                  ))}
                </div>
              </div>
            ) : (
              // Other languages - keep original layout
              <>
                {/* Vowels section with title */}
                <div className="mb-2">
                  <h3 className="text-xs text-[#FFD700] font-bold mb-1">{alphabetData.vowelsTitle}</h3>
                  <div className="flex gap-0.5 justify-center flex-wrap">
                    {alphabetData.vowels.map((letter, index) => (
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
                        number={index + 1}
                      />
                    ))}
                  </div>
                </div>

                {/* Consonants section with title */}
                <div className="mb-2">
                  <h3 className="text-xs text-[#FFD700] font-bold mb-1">{alphabetData.consonantsTitle}</h3>
                  {alphabetData.useGroups ? (
                    <div className="space-y-0.5">
                      {alphabetData.consonantGroups!.map((group, groupIndex) => (
                        <div key={groupIndex} className="grid grid-cols-5 gap-0.5">
                          {group.letters.map((letter, letterIndex) => {
                            const consonantNumber = alphabetData.vowels.length +
                              alphabetData.consonantGroups!.slice(0, groupIndex).reduce((sum, g) => sum + g.letters.length, 0) +
                              letterIndex + 1;
                            return (
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
                                number={consonantNumber}
                              />
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="grid grid-cols-5 sm:grid-cols-7 gap-0.5">
                      {alphabetData.consonants!.map((letter, index) => (
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
                          number={alphabetData.vowels.length + index + 1}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Special characters section with title */}
                {alphabetData.special.length > 0 && (
                  <div>
                    <h3 className="text-xs text-[#FFD700] font-bold mb-1">{alphabetData.specialTitle}</h3>
                    <div className="flex gap-0.5 justify-center flex-wrap">
                      {alphabetData.special.map((letter, index) => (
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
                          number={alphabetData.vowels.length + 33 + index + 1}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>

        {/* Right side - Category filters */}
        <div className="w-40 space-y-2">
          {language === 'sa' ? (
            <>
              {/* Sanskrit categories - grouped */}
              {categories.vowelCategories && categories.vowelCategories.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-[#FFD700] font-bold mb-1">Vowel Types</h4>
                  <div className="space-y-0.5">
                    {categories.vowelCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${ activeCategory === category.id ? 'bg-yellow-400 text-[#FFD700] font-bold ' : 'bg-gray-200 text-[#FFD700] font-bold hover:bg-gray-300' }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {categories.consonantCategories && categories.consonantCategories.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-[#FFD700] font-bold mb-1">Consonant Groups</h4>
                  <div className="space-y-0.5">
                    {categories.consonantCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${ activeCategory === category.id ? 'bg-yellow-400 text-[#FFD700] font-bold ' : 'bg-gray-200 text-[#FFD700] font-bold hover:bg-gray-300' }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {categories.characteristicCategories && categories.characteristicCategories.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-[#FFD700] font-bold mb-1">Characteristics</h4>
                  <div className="space-y-0.5">
                    {categories.characteristicCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${ activeCategory === category.id ? 'bg-yellow-400 text-[#FFD700] font-bold ' : 'bg-gray-200 text-[#FFD700] font-bold hover:bg-gray-300' }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Other languages - simple list */}
              {categories.simpleCategories && categories.simpleCategories.length > 0 && (
                <div>
                  <h4 className="text-[10px] text-[#FFD700] font-bold mb-1">
                    {language === 'ru' ? 'Категории' : language === 'uk' ? 'Категорії' : 'Categories'}
                  </h4>
                  <div className="space-y-0.5">
                    {categories.simpleCategories.map((category) => (
                      <button
                        key={category.id}
                        onClick={() => handleCategoryClick(category.id)}
                        className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${ activeCategory === category.id ? 'bg-yellow-400 text-[#FFD700] font-bold ' : 'bg-gray-200 text-[#FFD700] font-bold hover:bg-gray-300' }`}
                      >
                        {category.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
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
  number?: number;
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
  number,
}: LetterCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      className={`relative w-14 h-14 border flex flex-col items-center justify-center transition-colors flex-shrink-0 ${
        isSelected
          ? 'border-blue-500 bg-blue-50'
          : isHighlighted
          ? 'border-yellow-500 bg-yellow-50'
          : 'border-gray-300 bg-white hover:bg-gray-50'
      }`}
    >
      {number && (
        <div className="absolute top-0 right-0 text-[8px] text-[#FFD700] font-bold px-0.5">
          {number}
        </div>
      )}
      <div className="text-xl text-[#FFD700] font-bold">
        {display.main}
      </div>
      {!isHovered && 'devanagari' in letter && (
        <div className="text-[9px] text-[#FFD700] font-bold leading-none">{display.detail}</div>
      )}

      {showTooltip && isHovered && (
        <div className="absolute z-10 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs rounded px-2 py-1 whitespace-nowrap">
          {letter.pronunciation}
        </div>
      )}
    </motion.button>
  );
}
