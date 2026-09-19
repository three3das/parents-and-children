import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { type Word, type GameType, type MaterialWorld } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { GAME_CONFIG } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";
import { useAuth } from "@/lib/auth";
import { GameHeader } from "@/components/GameHeader";
import { GameMenu } from "@/components/GameMenu";
import { WordDisplay } from "@/components/WordDisplay";
import { PictureGrid } from "@/components/PictureGrid";
import { SpellWordGame } from "@/components/SpellWordGame";
import { CelebrationOverlay } from "@/components/CelebrationOverlay";
import { SyllablesGame } from "@/components/SyllablesGame";
import { SentenceGame } from "@/components/SentenceGame";
import { AudioPictureGame } from "@/components/AudioPictureGame";
import { AudioSentenceGame } from "@/components/AudioSentenceGame";
import { AlphabetTutor } from "@/components/AlphabetTutor";
import { motion } from "framer-motion";
// ⚠️ УБРАНО (мусор после переноса Settings/Login/CreateAccount/Progress
// в футер IshvaraPage.tsx): импорты LoginModal, CreateAccountModal,
// ProgressModal и useToast/toast — они использовались только теми
// хендлерами и модалками, которые больше нигде не открываются (см.
// комментарий ниже, у их прежнего места).

// Helper to read URL params
function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    game: params.get('game') as GameType | null,
    word: params.get('word'),
    locale: params.get('locale'),
  };
}

export default function Game() {
  // Initialize state from URL params
  const urlParams = getUrlParams();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [showCelebration, setShowCelebration] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [selectedPicture, setSelectedPicture] = useState<Word | null>(null);
  const [selectedSentence, setSelectedSentence] = useState<MaterialWorld | null>(null);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [gameType, setGameType] = useState<GameType>(urlParams.game || 'picture-match');
  // ⚠️ УБРАНО: showLoginModal / showCreateAccountModal / showProgressModal
  // — ничто их больше не открывает (кнопка в GameHeader, которая это
  // делала, убрана; вход/регистрация/настройки/прогресс теперь только
  // через футер IshvaraPage.tsx). Модалки ниже по файлу тоже убраны.
  const [sessionId] = useState(() => {
    // Check if we have a session ID in localStorage
    const stored = localStorage.getItem('russian-game-session');
    if (stored) {
      return stored;
    }
    // Create new session ID and store it
    const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    localStorage.setItem('russian-game-session', newSessionId);
    return newSessionId;
  });

  const queryClient = useQueryClient();
  const { t, language } = useLanguage();

  // Switch to alphabet when language changes

  const isFirstRender = useRef(true);
useEffect(() => {
  if (isFirstRender.current) {
    isFirstRender.current = false;
    return;
  }
  setGameType('alphabet-placeholder');
}, [language]);

  // Extended Word type with optional translation
  type WordWithTranslation = Word & { translatedWord?: string };

  // Fetch all words (with all=true to get ALL words from the table)
  // Pass language to get translated words when not Russian
  // For Sanskrit, use Russian as fallback since we don't have Sanskrit words yet
  const { data: words = [], isLoading: wordsLoading } = useQuery<WordWithTranslation[]>({
    queryKey: ["/api/words", sessionId, "all", language],
    queryFn: () => {
      const effectiveLang = language === 'sa' ? 'ru' : language;
      const langParam = effectiveLang !== 'ru' ? `&lang=${effectiveLang}` : '';
      return fetch(`/api/words?sessionId=${sessionId}&all=true${langParam}`).then(res => res.json());
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch today's progress
  const { data: todayProgress, isLoading: progressLoading } = useQuery<{ correctAnswersToday: number }>({
    queryKey: ["/api/progress/today", sessionId],
    queryFn: () => fetch(`/api/progress/today?sessionId=${sessionId}`).then(res => res.json()),
    staleTime: 30 * 1000, // 30 seconds
  });

  // Get current word
  const currentWord = words[currentWordIndex];

  // Fetch distractors for current word (picture-match and audio-picture modes)
  const { data: distractors = [], isLoading: distractorsLoading } = useQuery<Word[]>({
    queryKey: ["/api/words", currentWord?.id, "distractors"],
    enabled: !!currentWord?.id && (gameType === 'picture-match' || gameType === 'audio-picture'),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch spell letters for current word (spell-word mode)
  const { data: spellLettersData, isLoading: spellLettersLoading } = useQuery<{
    availableLetters: string[];
  }>({
    queryKey: ["/api/words", currentWord?.id, "spell-letters"],
    enabled: !!currentWord?.id && gameType === 'spell-word',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch syllable options for current word (syllables mode)
  const { data: syllableData, isLoading: syllableLoading } = useQuery<any, Error, {
    firstSyllable: string;
    options: string[];
    correctAnswer: string;
  } | null>({
    queryKey: ["/api/words", currentWord?.id, "syllables"],
    enabled: !!currentWord?.id && gameType === 'syllables',
    staleTime: 5 * 60 * 1000,
    select: (data: any) => {
      if (!data || !data.syllables || !data.correctSyllables) {
        return null;
      }

      let syllablesArray: string[];
      if (typeof data.syllables === 'string') {
        syllablesArray = data.syllables.split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      } else if (Array.isArray(data.syllables)) {
        syllablesArray = data.syllables;
      } else {
        syllablesArray = String(data.syllables).split(',').map((s: string) => s.trim()).filter((s: string) => s.length > 0);
      }

      return {
        firstSyllable: data.correctSyllables[0] || '',
        options: syllablesArray,
        correctAnswer: data.correctSyllables.join('')
      };
    }
  });

  // Fetch material world activities (audio-sentence mode)
  const { data: materialWorldActivities = [], isLoading: materialWorldLoading } = useQuery<MaterialWorld[]>({
    queryKey: ["/api/material-world"],
    enabled: gameType === 'audio-sentence',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Get current sentence for audio-sentence game
  const currentSentence = materialWorldActivities[currentSentenceIndex];

  // Fetch distractors for current sentence (audio-sentence mode)
  const { data: sentenceDistractors = [], isLoading: sentenceDistractorsLoading } = useQuery<MaterialWorld[]>({
    queryKey: ["/api/material-world", currentSentence?.id, "distractors"],
    enabled: !!currentSentence?.id && gameType === 'audio-sentence',
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Sync word index from URL param when words load
  useEffect(() => {
    if (words.length > 0 && urlParams.word) {
      const index = words.findIndex(w => w.id === urlParams.word);
      if (index !== -1 && index !== currentWordIndex) {
        setCurrentWordIndex(index);
      }
    }
  }, [words.length]); // Only run when words first load

  // Update URL when game state changes
  useEffect(() => {
    const params = new URLSearchParams();
    params.set('game', gameType);
    if (currentWord?.id) {
      params.set('word', currentWord.id);
    }
    params.set('locale', language);

    const newUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.replaceState({}, '', newUrl);
  }, [gameType, currentWord?.id, language]);

  // Mutation to record user answers
  const recordAnswerMutation = useMutation({
    mutationFn: (answerData: { wordId: string; isCorrect: boolean; sessionId: string; gameType: string }) =>
      fetch('/api/answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(answerData),
      }).then(res => res.json()),
    onSuccess: (data, variables) => {
      // Only invalidate today's progress when answer is correct
      if (variables.isCorrect) {
        queryClient.invalidateQueries({ queryKey: ["/api/progress/today", sessionId] });
      }
    }
  });

  const handlePictureSelect = (word: Word, isCorrect: boolean) => {
    // Prevent multiple selections while processing
    if (selectedPicture || showCelebration) return;

    setSelectedPicture(word);

    // Record the answer in the database
    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
        gameType: 'picture-match'
      });
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Reset selection after a moment
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  const handleWordComplete = (isCorrect: boolean) => {
    // Prevent multiple selections while processing
    if (selectedPicture || showCelebration) return;

    setSelectedPicture({ id: 'spell-complete', word: 'spell-complete', image: '', audio: '' } as Word);

    // Record the answer in the database
    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
        gameType: 'spell-word'
      });
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Reset selection after a moment
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  // Handler for incorrect letter selections in SpellWordGame
  const handleSpellIncorrectLetter = (letter: string) => {
    // Record incorrect answer in the database
    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect: false,
        sessionId,
        gameType: 'spell-word'
      });
    }
  };

  const handleSyllableSelect = (syllable: string, isCorrect: boolean) => {
    if (selectedPicture || showCelebration) return;

    setSelectedPicture({ id: syllable, word: syllable, image: '', audio: '' } as Word);

    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
        gameType: 'syllables'
      });
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  const handleSentenceAnswer = (isCorrect: boolean) => {
    if (selectedPicture || showCelebration) return;

    setSelectedPicture({ id: 'sentence-complete', word: 'sentence-complete', image: '', audio: '' } as Word);

    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
        gameType: 'sentence-game'
      });
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  const handleAudioPictureSelect = (word: Word, isCorrect: boolean) => {
    if (selectedPicture || showCelebration) return;

    setSelectedPicture(word);

    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
        gameType: 'audio-picture'
      });
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Show error for a moment, then move to next word
      setTimeout(() => {
        setSelectedPicture(null);
        // Move to next word after wrong answer
        queryClient.invalidateQueries({ queryKey: ["/api/words", sessionId, "all"] });
        if (currentWordIndex + 1 >= words.length) {
          setCurrentWordIndex(0); // Loop back to start
        } else {
          setCurrentWordIndex(prev => prev + 1);
        }
      }, 1500);
    }
  };

  const handleAudioSentenceSelect = (item: MaterialWorld, isCorrect: boolean) => {
    if (selectedSentence || showCelebration) return;

    setSelectedSentence(item);

    if (currentSentence) {
      recordAnswerMutation.mutate({
        wordId: currentSentence.id,
        isCorrect,
        sessionId,
        gameType: 'audio-sentence'
      });
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Show error for a moment, then move to next sentence
      setTimeout(() => {
        setSelectedSentence(null);
        // Move to next sentence after wrong answer
        if (currentSentenceIndex + 1 >= materialWorldActivities.length) {
          setCurrentSentenceIndex(0); // Loop back to start
        } else {
          setCurrentSentenceIndex(prev => prev + 1);
        }
      }, 1500);
    }
  };

  const handleNextWord = () => {
    setShowCelebration(false);
    setSelectedPicture(null);
    setSelectedSentence(null);

    // Handle audio-sentence game separately
    if (gameType === 'audio-sentence') {
      if (currentSentenceIndex + 1 >= materialWorldActivities.length) {
        setCurrentSentenceIndex(0); // Loop back to start
      } else {
        setCurrentSentenceIndex(prev => prev + 1);
      }
      return;
    }

    // Invalidate words query to get updated list (after celebration is done)
    queryClient.invalidateQueries({ queryKey: ["/api/words", sessionId, "all"] });

    if (currentWordIndex + 1 >= words.length) {
      setGameCompleted(true);
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };


  // ⚠️ УБРАНО: handleSettingsClick — открывал toast с кнопкой сброса
  // прогресса, вызывался только из onSettingsClick в GameHeader.
  // Настройки/сброс прогресса теперь доступны через футер
  // IshvaraPage.tsx, а не отсюда.

  const handleRestartGame = () => {
    setCurrentWordIndex(0);
    setCurrentSentenceIndex(0);
    setCorrectAnswers(0);
    setShowCelebration(false);
    setGameCompleted(false);
    setSelectedPicture(null);
    setSelectedSentence(null);
  };

  // ⚠️ УБРАНО: handleResetProgress — вызывался только изнутри
  // handleSettingsClick (см. выше), больше нигде не используется.

  const handleGameTypeChange = (newGameType: GameType) => {
    setGameType(newGameType);
    setSelectedPicture(null);
    setSelectedSentence(null);
    setShowCelebration(false);
  };

  // ⚠️ УБРАНО: handleLoginClick / handleCreateAccountClick /
  // switchToCreateAccount / switchToLogin — управляли
  // showLoginModal/showCreateAccountModal, которых больше нет; вход и
  // регистрация теперь только через футер IshvaraPage.tsx.

  const handleSyllableAnswer = (isCorrect: boolean) => {
    if (selectedPicture || showCelebration) return;

    setSelectedPicture({ id: 'syllable-answer', word: 'syllable-answer', image: '', audio: '' } as Word);

    // Record the answer in the database
    if (currentWord) {
      recordAnswerMutation.mutate({
        wordId: currentWord.id,
        isCorrect,
        sessionId,
        gameType: 'syllables'
      });
    }

    if (isCorrect) {
      setCorrectAnswers(prev => prev + 1);
      setShowCelebration(true);
    } else {
      // Reset selection after a moment
      setTimeout(() => {
        setSelectedPicture(null);
      }, 1500);
    }
  };

  if (wordsLoading || progressLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <motion.div
            className="text-6xl mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            📚
          </motion.div>
          <p className="text-2xl font-bold text-child-text">{t.loadingWords}</p>
        </div>
      </div>
    );
  }

  if (gameCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <motion.div
          className="text-center bg-white rounded-3xl p-8 shadow-2xl mx-4 max-w-md"
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
        >
          <div className="text-8xl mb-6">🏆</div>
          <h1 className="text-4xl font-bold text-primary mb-4">{t.congratulations}</h1>
          <p className="text-2xl text-child-text mb-4">
            {t.completedAllWords}
          </p>
          <p className="text-xl text-secondary mb-6 font-semibold">
            {t.correctAnswersToday} {todayProgress?.correctAnswersToday || 0}
          </p>

          <div className="space-y-4">
            <motion.button
              onClick={handleRestartGame}
              className="w-full bg-primary hover:bg-purple-700 text-white font-bold py-4 px-8 rounded-full text-xl transition-colors duration-200"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {t.playAgain} 🎮
            </motion.button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Show loading only if we don't have the current word at all
  const isInitialLoading = !currentWord;

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-xl text-child-text">{t.preparingTask}</p>
        </div>
      </div>
    );
  }

  return (
    // ⚠️ ПРАВКА (адаптивная вёрстка / мобильные устройства): на
    // мобильном (< sm) убраны h-screen/overflow-hidden — иначе
    // контент AlphabetTutor в вертикальном стеке (Functions → панель
    // письма → таблица букв) не помещался в жёстко заданную высоту
    // экрана и обрезался без возможности прокрутки. На sm: и выше
    // поведение не изменилось — фиксированная высота, без общей
    // прокрутки страницы, как и было задумано изначально.
    <div className="h-auto overflow-visible sm:h-screen sm:overflow-hidden flex flex-col">
      {/* ⚠️ ПРАВКА: GameHeader больше не принимает onSettingsClick /
          onLoginClick / onCreateAccountClick / onProgressClick — этих
          пропсов больше нет в GameHeaderProps (см. GameHeader.tsx —
          AuthDropdown и связанные с ним пропы убраны из шапки, вход /
          регистрация / настройки теперь через футер на IshvaraPage.tsx).
          Раньше эти пропы всё ещё передавались сюда по инерции — из-за
          этого TypeScript ругался: "onSettingsClick does not exist on
          type GameHeaderProps". Убрал их из вызова; сам GameHeader
          теперь получает только то, что ему действительно нужно. */}
      <GameHeader
        currentWordIndex={currentWordIndex}
        totalWords={words.length}
        correctAnswersToday={todayProgress?.correctAnswersToday || 0}
      />

      {/* ⚠️ ПРАВКА (устранение скролла в AlphabetTutor): main теперь
          flex-колонка вместо простого блочного контейнера. Раньше
          GameMenu и игровой контент шли друг под другом внутри main
          с overflow-y-auto — AlphabetTutor внутри запрашивал h-full
          (100% высоты main), но GameMenu уже занимал часть этой
          высоты сверху, из-за чего суммарная высота превышала место
          в main и появлялся вертикальный скролл, сколько бы ни
          подгонялись пропорции внутри самого AlphabetTutor.
          Теперь: GameMenu — flex-shrink-0 (занимает свою естественную
          высоту), а контент игры — flex-1 min-h-0 overflow-y-auto
          (получает ровно оставшееся место; AlphabetTutor с его
          h-full корректно вписывается в эту высоту). Скролл для
          остальных игр (picture-match и т.д.) сохранён — он теперь
          просто на внутренней обёртке, а не на main целиком.
          ⚠️ ПРАВКА (мобильная адаптивность): overflow-hidden на main
          заменён на overflow-visible на мобильном (< sm) — иначе
          контент AlphabetTutor, растянутый в вертикальный стек,
          обрезался бы этим же свойством ещё до того, как получал бы
          шанс прокрутиться во внутренней обёртке ниже. На sm: и
          выше — прежнее поведение (overflow-hidden). */}
      <main className="flex-1 overflow-visible sm:overflow-hidden max-w-6xl mx-auto px-4 pt-2 pb-8 w-full flex flex-col">
        <div className="flex-shrink-0">
          <GameMenu
            currentGameType={gameType}
            onGameTypeChange={handleGameTypeChange}
          />
        </div>

        {/* ⚠️ ПРАВКА (мобильная адаптивность): на мобильном (< sm)
            эта обёртка больше не имеет собственной высоты/прокрутки
            (overflow-visible, без min-h-0/flex-1 constraints по
            высоте) — весь контент, включая AlphabetTutor, просто
            растёт по естественной высоте, и скроллится сама страница
            (см. правку на корневом div выше). На sm: и выше —
            исходное поведение: flex-1 min-h-0 overflow-y-auto,
            собственная внутренняя прокрутка в пределах main. */}
        <div className="overflow-visible sm:flex-1 sm:min-h-0 sm:overflow-y-auto">
          {gameType === 'alphabet-placeholder' && (
            <AlphabetTutor />
          )}

          {gameType === 'picture-match' && (
            <>
              {distractorsLoading ? (
                <div className="text-center py-8">
                  <div className="text-2xl"> </div>
                  <p className="text-sm text-[#FFD700] font-bold">...</p>
                </div>
              ) : (
                <PictureGrid
                  correctWord={currentWord}
                  distractors={distractors || []}
                  onPictureSelect={handlePictureSelect}
                  disabled={!!selectedPicture || showCelebration}
                  selectedPicture={selectedPicture}
                />
              )}

              <div className="mt-2 sm:mt-4">
                <WordDisplay word={currentWord.translatedWord || currentWord.word} />
              </div>

              <div className="text-center mt-2 sm:mt-8">
                <motion.div
                  className="text-4xl sm:text-6xl"
                  animate={{
                    rotate: [-10, 10, -10],
                    scale: [1, 1.1, 1]
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                >
                  👆
                </motion.div>
              </div>
            </>
          )}

          {gameType === 'spell-word' && (
            spellLettersLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl">⏳</div>
                <p className="text-sm text-[#FFD700] font-bold">{t.preparingLetters}</p>
              </div>
            ) : spellLettersData ? (
              <SpellWordGame
                word={currentWord}
                availableLetters={spellLettersData.availableLetters}
                onWordComplete={handleWordComplete}
                onIncorrectLetter={handleSpellIncorrectLetter}
                disabled={!!selectedPicture || showCelebration}
              />
            ) : null
          )}

          {gameType === 'syllables' && (
            <SyllablesGame
              onAnswer={handleSyllableAnswer}
              disabled={!!selectedPicture || showCelebration}
            />
          )}

          {gameType === 'sentence-game' && (
            <SentenceGame
              onAnswer={handleSentenceAnswer}
              disabled={!!selectedPicture || showCelebration}
            />
          )}

          {gameType === 'audio-picture' && (
            distractorsLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl">⏳</div>
                <p className="text-sm text-[#FFD700] font-bold">{t.loadingOptions}</p>
              </div>
            ) : (
              <AudioPictureGame
                word={currentWord}
                distractors={distractors || []}
                onPictureSelect={handleAudioPictureSelect}
                disabled={!!selectedPicture || showCelebration}
                selectedPicture={selectedPicture}
              />
            )
          )}

          {gameType === 'audio-sentence' && (
            materialWorldLoading || sentenceDistractorsLoading ? (
              <div className="text-center py-8">
                <div className="text-2xl">⏳</div>
                <p className="text-sm text-[#FFD700] font-bold">{t.loadingOptions}</p>
              </div>
            ) : currentSentence ? (
              <AudioSentenceGame
                sentence={currentSentence}
                distractors={sentenceDistractors || []}
                onSelect={handleAudioSentenceSelect}
                disabled={!!selectedSentence || showCelebration}
                selectedItem={selectedSentence}
              />
            ) : (
              <div className="text-center py-8">
                <div className="text-2xl">📭</div>
                <p className="text-sm text-[#FFD700] font-bold">{t.loading}</p>
              </div>
            )
          )}
        </div>
      </main>
      <CelebrationOverlay
        key={`celebration-${currentWord?.id}-${correctAnswers}`}
        isVisible={showCelebration}
        onNext={handleNextWord}
      />
      {/* ⚠️ УБРАНО: LoginModal / CreateAccountModal / ProgressModal —
          открывались только из showLoginModal/showCreateAccountModal/
          showProgressModal, которых больше нет в этом файле. Если эти
          модалки всё ещё нужны где-то в приложении — их должен
          рендерить компонент, который реально их открывает (например,
          футер на IshvaraPage.tsx или общий layout в App.tsx), а не
          game.tsx. */}
    </div>
  );
}