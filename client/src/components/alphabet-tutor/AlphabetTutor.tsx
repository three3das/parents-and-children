import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { BookOpen, Volume2 } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import { useLanguageScript } from '@/lib/languageScript';
import { BORDER_WIDTH, GOLD_100, GOLD_33, GOLD_67, SILVER, WHITE } from './constants';
import { DictionaryModal } from './DictionaryModal';
import { DrawingPad } from './DrawingPad';
import { useAlphabetLetters, useScriptTexts } from './hooks';
import { getGroupLabel, L, pickLabel } from './labels';
import { LetterCard } from './LetterCard';
import { SAMKHYA_ITEMS } from './samkhya';
import { playLetterSound } from './letterAudio';
import type { LetterGroup } from './types';

// Общие классы зон 1 и 2 правой панели. Обе — золотые, с белым текстом.
const ZONE_CLASS =
  'flex-[0.5] min-h-0 rounded-xl shadow-md flex flex-col items-center justify-center gap-0 sm:gap-0.5 p-1 sm:p-2 overflow-hidden';
const ZONE_STYLE = { backgroundColor: GOLD_100, border: `${BORDER_WIDTH}px solid ${GOLD_100}` };
const ZONE_SYMBOL_SIZE = 'clamp(16px, 3.4vw, 36px)';

export function AlphabetTutor() {
  const { language } = useLanguage();
  const { script, scriptLabel } = useLanguageScript();
  const uiLanguage = ['ru', 'uk', 'en'].includes(language) ? language : 'en';

  const { letters, loading } = useAlphabetLetters(language);
  const [audioEnabled, setAudioEnabled] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [dictOpen, setDictOpen] = useState(false);
  // true — открыт раздел «Samkhya-prakaranam»: блок Categories скрыт.
  const [samkhyaOpen, setSamkhyaOpen] = useState(false);
  // Выбранная кнопка внутри раздела «Samkhya-prakaranam» (id из SAMKHYA_ITEMS).
  const [activeSamkhya, setActiveSamkhya] = useState<string | null>(null);
  // После первого открытия словаря кнопка перестаёт пульсировать.
  const [dictHintSeen, setDictHintSeen] = useState(false);

  // Смена языка сбрасывает выбор и закрывает словарь.
  useEffect(() => {
    setSelectedId(null);
    setActiveCategory(null);
    setDictOpen(false);
    setSamkhyaOpen(false);
    setActiveSamkhya(null);
  }, [language]);

  const groups: LetterGroup[] = useMemo(() => {
    const byType = new Map<string, LetterGroup>();
    for (const letter of letters) {
      const type = letter.letter_type || 'other';
      if (!byType.has(type)) byType.set(type, { type, letters: [] });
      byType.get(type)!.letters.push(letter);
    }
    return [...byType.values()];
  }, [letters]);

  const selectedLetter = useMemo(
    () => letters.find((l) => l.id === selectedId) ?? null,
    [letters, selectedId]
  );
  const activeSamkhyaItem = SAMKHYA_ITEMS.find((item) => item.id === activeSamkhya) ?? null;
  const scriptTexts = useScriptTexts(selectedLetter?.id ?? null, [script]);
  // Основная (первая выбранная) система письма — для холста.
  const scriptText = scriptTexts[script] ?? null;

  // Для санскрита латиница (IAST) пишется строчными буквами, как в учебных
  // материалах; для остальных языков — как раньше, заглавными.
  const formatScript = (text: string) =>
    language === 'sa' ? text.toLocaleLowerCase(uiLanguage) : text.toLocaleUpperCase(uiLanguage);

  function handleLetterClick(id: string, grapheme: string) {
    setSelectedId(id);
    if (audioEnabled) playLetterSound(language, grapheme);
  }

  function openDictionary() {
    if (!selectedLetter) return;
    setDictHintSeen(true);
    setDictOpen(true);
  }

  if (loading || letters.length === 0) {
    return (
      <div className="max-w-7xl mx-auto p-4 text-center">
        <p className="text-sm font-bold" style={{ color: SILVER }}>
          {pickLabel(loading ? L.loading : L.noData, uiLanguage)}
        </p>
      </div>
    );
  }

  const pulseDictButton = Boolean(selectedLetter) && !dictHintSeen;

  const sidebarButtonStyle = (active: boolean, activeColor: string) =>
    active
      ? { backgroundColor: activeColor, color: WHITE, border: `${BORDER_WIDTH}px solid ${activeColor}` }
      : { backgroundColor: WHITE, color: SILVER, border: `${BORDER_WIDTH}px solid ${GOLD_33}` };

  const sidebarHover = (active: boolean) => ({
    onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!active) e.currentTarget.style.backgroundColor = GOLD_33;
    },
    onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!active) e.currentTarget.style.backgroundColor = WHITE;
    },
  });

  return (
    <div className="max-w-7xl mx-auto p-1 sm:p-4 h-full overflow-y-auto sm:overflow-visible" style={{ backgroundColor: WHITE }}>
      {/* Мобильный: колонка, страница растёт по контенту.
          sm и выше: ряд. Порядок на мобильном: сайдбар → правая панель → таблица. */}
      <div className="flex flex-col sm:flex-row gap-1.5 sm:gap-4 sm:items-stretch h-full">
        {/* ЛЕВАЯ КОЛОНКА — функции и категории */}
        <div className="w-full sm:w-40 flex-shrink-0 flex flex-wrap items-center gap-1 sm:block sm:space-y-4">
          <div className="contents sm:block">
            <h4 className="hidden sm:block text-[10px] font-bold mb-1" style={{ color: SILVER }}>
              {pickLabel(L.functions, uiLanguage)}
            </h4>
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className="sm:w-full text-left px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[11px] sm:text-xs font-bold transition-colors"
              style={sidebarButtonStyle(audioEnabled, GOLD_100)}
              {...sidebarHover(audioEnabled)}
            >
              <Volume2
                className="inline-block w-3.5 h-3.5 mr-1 align-text-bottom"
                style={{ color: audioEnabled ? WHITE : SILVER }}
                strokeWidth={2.5}
              />
              {pickLabel(L.audio, uiLanguage)}
            </button>
          </div>

          {!samkhyaOpen && (
            <div className="contents sm:block">
              <h4 className="hidden sm:block text-[10px] font-bold mb-1" style={{ color: SILVER }}>
                {pickLabel(L.categories, uiLanguage)}
              </h4>
              <div className="contents sm:block sm:space-y-0.5">
                {groups.map((group) => {
                  const isActive = activeCategory === group.type;
                  return (
                    <button
                      key={group.type}
                      onClick={() => setActiveCategory(isActive ? null : group.type)}
                      className="sm:w-full text-left px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[11px] sm:text-xs font-bold transition-colors"
                      style={sidebarButtonStyle(isActive, GOLD_67)}
                      {...sidebarHover(isActive)}
                    >
                      {getGroupLabel(group.type, uiLanguage)}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="contents sm:block">
            <h4 className="hidden sm:block text-[10px] font-bold mb-1" style={{ color: SILVER }}>
              {pickLabel(samkhyaOpen ? L.sankhyaPrakaranam : L.harinamamrita, uiLanguage)}
            </h4>
            {samkhyaOpen ? (
              <div className="contents sm:block sm:space-y-0.5">
                {SAMKHYA_ITEMS.map((item) => {
                  const isActive = activeSamkhya === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveSamkhya(isActive ? null : item.id)}
                      className="sm:w-full text-left px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[11px] sm:text-xs font-bold transition-colors"
                      style={sidebarButtonStyle(isActive, GOLD_67)}
                      {...sidebarHover(isActive)}
                    >
                      {pickLabel(item.label, uiLanguage)}
                    </button>
                  );
                })}
                <button
                  onClick={() => {
                    setSamkhyaOpen(false);
                    setActiveSamkhya(null);
                  }}
                  className="sm:w-full text-left px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[11px] sm:text-xs font-bold transition-colors"
                  style={sidebarButtonStyle(false, GOLD_67)}
                  {...sidebarHover(false)}
                >
                  {pickLabel(L.back, uiLanguage)}
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setSamkhyaOpen(true);
                  setActiveCategory(null);
                }}
                className="sm:w-full text-left px-1.5 py-0.5 sm:px-2 sm:py-1 rounded text-[11px] sm:text-xs font-bold transition-colors"
                style={sidebarButtonStyle(false, GOLD_67)}
                {...sidebarHover(false)}
              >
                {pickLabel(L.sankhyaPrakaranam, uiLanguage)}
              </button>
            )}
          </div>
        </div>

        {/* ЦЕНТР — таблица букв */}
        <div className="w-full sm:flex-1 min-w-0 flex-shrink-0 sm:flex-shrink order-1 sm:order-none overflow-visible sm:overflow-auto">
          <div
            className="p-1 sm:p-3 rounded space-y-1 sm:space-y-2"
            style={{ backgroundColor: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }}
          >
            {groups.map((group) => (
              <div key={group.type}>
                <h3 className="text-[10px] sm:text-xs font-bold mb-0.5 sm:mb-1 leading-none sm:leading-normal" style={{ color: SILVER }}>
                  {getGroupLabel(group.type, uiLanguage)}
                </h3>
                <div className="grid grid-cols-11 gap-0.5 sm:flex sm:justify-start sm:flex-wrap">
                  {group.letters.map((letter) => (
                    <LetterCard
                      key={letter.id}
                      letter={letter}
                      isHighlighted={
                        samkhyaOpen
                          ? Boolean(activeSamkhyaItem?.matches(letter))
                          : activeCategory === group.type
                      }
                      isSelected={selectedId === letter.id}
                      onClick={() => handleLetterClick(letter.id, letter.grapheme)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ПРАВАЯ ПАНЕЛЬ — три зоны (высота 0.5 / 0.5 / 1.4) */}
        <div className="w-full sm:w-64 sm:flex-shrink-0 flex-1 min-h-[120px] sm:flex-none sm:min-h-0 sm:h-full order-2 sm:order-none grid grid-cols-[38%_1fr] grid-rows-2 gap-1.5 sm:gap-2 sm:flex sm:flex-col">
          {/* Зона 1 — буква в выбранной системе письма (золотая, белый текст). */}
          <div
            className={`col-start-1 row-start-1 ${ZONE_CLASS}`}
            style={ZONE_STYLE}
          >
            <span className="block text-[8px] sm:text-[10px] font-bold" style={{ color: WHITE }}>
              {pickLabel(L.letterZone, uiLanguage)}
            </span>
            <div
              className="font-bold text-center leading-none break-words"
              style={{ color: WHITE, fontSize: ZONE_SYMBOL_SIZE }}
            >
              {selectedLetter && scriptText ? formatScript(scriptText) : '—'}
            </div>
            <span className="block text-[8px] sm:text-[10px] font-bold text-center leading-tight" style={{ color: WHITE }}>
              {pickLabel(L.scriptZone, uiLanguage)} «{scriptLabel}»
            </span>
          </div>

          {/* Зона 2 — буква языка + кнопка «Слова на эту букву» */}
          <motion.button
            type="button"
            onClick={openDictionary}
            disabled={!selectedLetter}
            title={pickLabel(L.dictOpenHint, uiLanguage)}
            aria-label={pickLabel(L.dictOpenHint, uiLanguage)}
            whileHover={selectedLetter ? { scale: 1.04 } : undefined}
            whileTap={selectedLetter ? { scale: 0.96 } : undefined}
            animate={
              pulseDictButton
                ? {
                    boxShadow: [
                      '0 0 0 0 rgba(255, 215, 0, 0.75)',
                      '0 0 0 14px rgba(255, 215, 0, 0)',
                    ],
                  }
                : { boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }
            }
            transition={
              pulseDictButton
                ? { duration: 1.4, repeat: Infinity, ease: 'easeOut' }
                : { duration: 0.2 }
            }
            className={`relative w-full col-start-1 row-start-2 ${ZONE_CLASS} ${selectedLetter ? 'cursor-pointer' : 'cursor-default'}`}
            style={ZONE_STYLE}
          >
            <span className="block text-[8px] sm:text-[10px] font-bold" style={{ color: WHITE }}>
              {pickLabel(L.letterZone, uiLanguage)}
            </span>
            <span
              className="block font-bold text-center leading-none break-words"
              style={{ color: WHITE, fontSize: ZONE_SYMBOL_SIZE }}
            >
              {selectedLetter?.grapheme ?? '—'}
            </span>
            {selectedLetter ? (
              <span
                className="mt-0.5 inline-flex items-center gap-1 px-1.5 sm:px-2 py-0 sm:py-0.5 rounded-full bg-white text-[8px] sm:text-[10px] font-bold"
                style={{ color: SILVER }}
              >
                <BookOpen className="w-3 h-3" strokeWidth={2.5} />
                {pickLabel(L.dictCta, uiLanguage)}
              </span>
            ) : (
              <span className="block text-[8px] sm:text-[10px] font-bold" style={{ color: WHITE }}>
                {pickLabel(L.dictNeedLetter, uiLanguage)}
              </span>
            )}
          </motion.button>

          {/* Зона 3 — холст (тоже золотой) */}
          <div className="col-start-2 row-start-1 row-span-2 min-h-0 sm:row-span-1 sm:flex-[1.4]">
            <DrawingPad
              letterSymbol={selectedLetter?.grapheme ?? null}
              scriptSymbol={scriptText ? formatScript(scriptText) : null}
              uiLanguage={uiLanguage}
            />
          </div>
        </div>
      </div>

      {dictOpen && selectedLetter && (
        <DictionaryModal
          letter={selectedLetter}
          language={language}
          uiLanguage={uiLanguage}
          onClose={() => setDictOpen(false)}
        />
      )}
    </div>
  );
}