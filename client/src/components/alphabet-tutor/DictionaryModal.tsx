import { useEffect, useMemo, useState } from 'react';
import { Volume2, X } from 'lucide-react';
import { BORDER_WIDTH, GOLD_100, GOLD_33, SILVER, SPEECH_LOCALE, WHITE } from './constants';
import { useDictionaryWords } from './hooks';
import { L, pickLabel } from './labels';
import { speak, stopSpeech } from './speech';
import type { LetterRow } from './types';

interface DictionaryModalProps {
  letter: LetterRow;
  language: string;
  uiLanguage: string;
  onClose: () => void;
}

// Окно со словами на выбранную букву. Монтируется только когда открыто,
// поэтому слова загружаются заново при каждом открытии (ответ кэшируется
// браузером). Клик по слову озвучивает его независимо от переключателя
// «Озвучивание».
export function DictionaryModal({ letter, language, uiLanguage, onClose }: DictionaryModalProps) {
  const { words, loading, error } = useDictionaryWords(language);
  const [speakingId, setSpeakingId] = useState<string | null>(null);

  function close() {
    stopSpeech();
    onClose();
  }

  // Escape закрывает окно; при размонтировании — остановить речь.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      stopSpeech();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Для ru берём word, для остальных — translatedWord (слова без перевода
  // пропускаем).
  const letterWords = useMemo(() => {
    const locale = SPEECH_LOCALE[language] ?? 'en-US';
    const target = letter.grapheme.normalize('NFC').toLocaleLowerCase(locale);
    const result: { id: string; text: string }[] = [];
    for (const w of words) {
      const raw = language === 'ru' ? w.word : w.translatedWord;
      const text = raw?.trim();
      if (text && text.normalize('NFC').toLocaleLowerCase(locale).startsWith(target)) {
        result.push({ id: w.id, text });
      }
    }
    return result.sort((a, b) => a.text.localeCompare(b.text, locale));
  }, [words, letter, language]);

  function speakWord(id: string, text: string) {
    const clear = () => setSpeakingId((cur) => (cur === id ? null : cur));
    speak(text, language, 0.8, { onStart: () => setSpeakingId(id), onEnd: clear });
  }

  const title = pickLabel(L.dictTitle, uiLanguage);

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-[9998]" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${title} ${letter.grapheme}`}
        className="fixed top-1/2 left-1/2 w-[92%] max-w-xl max-h-[80vh] bg-white rounded-2xl border-2 shadow-2xl z-[9999] p-4 flex flex-col gap-3"
        style={{ transform: 'translate(-50%, -50%)', borderColor: GOLD_100 }}
      >
        <div className="flex items-center justify-between gap-2 flex-shrink-0">
          <h3 className="text-lg font-bold" style={{ color: SILVER }}>
            {title} «{letter.grapheme}»
          </h3>
          <button
            type="button"
            onClick={close}
            aria-label={pickLabel(L.close, uiLanguage)}
            title={pickLabel(L.close, uiLanguage)}
            className="rounded-full p-1 border-2 bg-white hover:bg-[#FFF2AB] transition-colors"
            style={{ color: SILVER, borderColor: GOLD_100 }}
          >
            <X className="w-4 h-4" strokeWidth={3} />
          </button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto">
          {loading ? (
            <p className="text-sm font-bold" style={{ color: SILVER }}>
              {pickLabel(L.dictLoading, uiLanguage)}
            </p>
          ) : error ? (
            <p className="text-sm font-bold" style={{ color: SILVER }} role="alert">
              {pickLabel(L.dictError, uiLanguage)}
            </p>
          ) : letterWords.length === 0 ? (
            <p className="text-sm font-bold" style={{ color: SILVER }}>
              {pickLabel(L.dictEmpty, uiLanguage)}
            </p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {letterWords.map((w) => {
                const speaking = speakingId === w.id;
                return (
                  <button
                    key={w.id}
                    type="button"
                    onClick={() => speakWord(w.id, w.text)}
                    className={`px-3 py-1.5 rounded-full text-sm font-bold transition-colors ${
                      speaking ? '' : 'bg-white hover:bg-[#FFF2AB]'
                    }`}
                    style={
                      speaking
                        ? { backgroundColor: GOLD_100, color: WHITE, border: `${BORDER_WIDTH}px solid ${GOLD_100}` }
                        : { color: SILVER, border: `${BORDER_WIDTH}px solid ${GOLD_33}` }
                    }
                  >
                    <Volume2 className="inline-block w-3.5 h-3.5 mr-1 align-text-bottom" strokeWidth={2.5} />
                    {w.text}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <p className="text-[11px] font-bold flex-shrink-0" style={{ color: SILVER }}>
          {pickLabel(L.dictHint, uiLanguage)}
        </p>
      </div>
    </>
  );
}