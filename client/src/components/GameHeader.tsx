import { motion } from "framer-motion";
import { useMemo } from "react";
import { GAME_CONFIG, ANIMATION_VARIANTS } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useLanguageScript } from "@/lib/languageScript";
import { WHEEL_TEXT_COLOR } from "@/lib/colors";

// Общий вид кнопок шапки: золотая рамка, синие буквы (как на колёсах).
const HEADER_BUTTON_CLASS =
  "flex-shrink-0 px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full border-2 border-[#FFD700] bg-white " +
  "font-bold text-[10px] sm:text-sm leading-tight whitespace-nowrap " +
  "hover:bg-yellow-50 transition-colors";

// ⚠️ Импорт LanguageSwitcher убран намеренно: раньше в шапке игры был
// свой собственный переключатель языка ("EN English ▾"), дублирующий
// выбор языка на главной странице сайта (IshvaraPage.tsx → кнопка
// "Меню" в футере → "Языки"). Теперь язык интерфейса выбирается только
// там — единая точка выбора вместо двух независимых переключателей.
//
// ⚠️ ПРАВКА (эта версия): кнопка AuthDropdown ("значок пользователя"
// справа, открывавший выпадающее меню "Оформить подписку" / "Войти" /
// "Регистрация" / "Настройки") убрана из шапки полностью — вместе с
// импортом компонента и связанными пропсами (onSettingsClick,
// onLoginClick, onCreateAccountClick, onProgressClick), которые
// использовались только для передачи в неё. Подписка, вход,
// регистрация и настройки теперь доступны через кнопки футера
// (IshvaraPage.tsx: "Начальная страница сайта" / "Ваша страница" /
// "Все страницы сайта" / "Меню") — дублирующая кнопка в шапке игры
// больше не нужна.
interface GameHeaderProps {
  currentWordIndex: number;
  totalWords: number;
  correctAnswersToday: number;
  // Необязательная замена действия кнопки-дискеты. В «Калькуляторе»
  // сохранение в файл пока заглушка — game.tsx передаёт сюда обработчик,
  // который показывает сообщение. В остальных играх не задаётся, и
  // дискета работает как раньше (handleSaveResult).
  onSave?: () => void;
}

export function GameHeader({ currentWordIndex, totalWords, correctAnswersToday, onSave }: GameHeaderProps) {
  const { t } = useLanguage();
  const [, navigate] = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const { openLanguageWheel, openScriptWheel } = useLanguageScript();

  // Кнопка «Сохранить результат»: гость сначала идёт регистрироваться
  // (/auth), вошедший — на страницу «Предмет изучения».
  // ВРЕМЕННО: само сохранение результата и колесо «Предмет изучения»
  // добавляются на следующих шагах.
  const handleSaveResult = () => {
    if (onSave) {
      onSave();
      return;
    }
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    navigate("/?skipSplash=true&open=stable");
  };

  const handleLogout = () => {
    if (window.confirm("Выйти из аккаунта?")) {
      logout();
      navigate("/");
    }
  };

  // Calculate progress based on today's correct answers
  const targetAnswers = GAME_CONFIG.dailyGoal;
  const progressPercentage = Math.min((correctAnswersToday / targetAnswers) * 100, 100);
  const isGoalReached = correctAnswersToday >= targetAnswers;

  // Memoize achievement status to prevent unnecessary re-renders
  const achievementStatus = useMemo(() => {
    if (isGoalReached) {
      return {
        text: t.goalReached,
        color: 'text-green-600',
        bgColor: 'from-green-400 to-green-500'
      };
    }
    if (correctAnswersToday >= targetAnswers * 0.75) {
      return {
        text: t.almostDone,
        color: 'text-orange-600',
        bgColor: 'from-orange-400 to-orange-500'
      };
    }
    return {
      text: `${correctAnswersToday}/${targetAnswers}`,
      color: 'text-primary',
      bgColor: 'from-primary to-purple-500'
    };
  }, [correctAnswersToday, targetAnswers, isGoalReached, t]);

  return (
    <motion.header
      className="glass rounded-2xl p-1 sm:p-2 mb-1 sm:mb-3 gpu-accelerated overflow-visible relative z-[9999]"
      {...ANIMATION_VARIANTS.slideDown}
    >
      <div className="max-w-4xl mx-auto overflow-visible">
        <div className="flex items-center justify-between overflow-visible gap-1">
          {/* Back button for mobile + Logo with KidRead */}
          <motion.div
            className="flex items-center gap-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Back button - visible only on mobile */}
            <button
              onClick={() => window.history.back()}
              className="md:hidden flex items-center justify-center w-7 h-7 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0"
            >
              <svg
                className="w-4 h-4 text-[#FFD700] font-bold"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* 📚 и «KidRead» убраны по просьбе. Вместо них — кнопки
                выбора языка и письменности (те же колёса, что в «Меню»). */}
            <button
              type="button"
              onClick={openLanguageWheel}
              className={HEADER_BUTTON_CLASS}
              style={{ color: WHEEL_TEXT_COLOR }}
            >
              Языки
            </button>
            <button
              type="button"
              onClick={openScriptWheel}
              className={HEADER_BUTTON_CLASS}
              style={{ color: WHEEL_TEXT_COLOR }}
            >
              Письменности
            </button>
          </motion.div>

          {/* Visual Progress - Icons Only */}
          <motion.div
            className="flex items-center gap-1 md:gap-4 flex-shrink"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Daily Progress with Stars */}
            <div className="flex items-center gap-1">
              <span className="text-sm md:text-lg flex-shrink-0">🌟</span>
              <div className="flex items-center gap-0.5">
                <span className={`text-sm md:text-lg font-bold ${achievementStatus.color}`}>
                  {correctAnswersToday}
                </span>
                <span className="text-xs text-muted-foreground hidden sm:inline">/</span>
                <span className="text-xs text-muted-foreground hidden sm:inline">{targetAnswers}</span>
              </div>
              <div className="hidden sm:block bg-muted/50 rounded-full h-1.5 md:h-2 w-8 md:w-16 overflow-hidden flex-shrink-0">
                <motion.div
                  className={`bg-gradient-to-r ${achievementStatus.bgColor} rounded-full h-1.5 md:h-2`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                />
              </div>
              {isGoalReached && (
                <motion.span
                  className="text-sm md:text-xl flex-shrink-0"
                  animate={{
                    scale: [1, 1.3, 1],
                    rotate: [0, 15, -15, 0]
                  }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    repeatDelay: 2
                  }}
                >
                  🎉
                </motion.span>
              )}
            </div>

            {/* Сохранить личный результат (значок дискеты) */}
            <button
              type="button"
              onClick={handleSaveResult}
              aria-label="Сохранить результат"
              title="Сохранить результат"
              className="flex-shrink-0 flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 border-[#FFD700] bg-white hover:bg-yellow-50 transition-colors"
              style={{ color: WHEEL_TEXT_COLOR }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
                <path d="M17 21v-8H7v8" />
                <path d="M7 3v5h8" />
              </svg>
            </button>

            {/* Выход из аккаунта — только для вошедшего пользователя */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className={HEADER_BUTTON_CLASS}
                style={{ color: WHEEL_TEXT_COLOR }}
              >
                Выйти
              </button>
            )}

            {/* Session Progress with Game Icons */}
            {totalWords > 0 && (
              <div className="hidden sm:flex items-center gap-2 border-l border-border/50 pl-4">
                <span className="text-lg">🎮</span>
                <span className="text-sm font-bold">
                  {Math.min(currentWordIndex + 1, totalWords)}
                </span>
                <span className="text-xs text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">
                  {totalWords}
                </span>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </motion.header>
  );
}