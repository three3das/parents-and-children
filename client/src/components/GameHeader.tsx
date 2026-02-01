import { motion } from "framer-motion";
import { useMemo } from "react";
import { GAME_CONFIG, ANIMATION_VARIANTS } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";
import { LanguageSwitcher } from "./LanguageSwitcher";
import { AuthDropdown } from "./AuthDropdown";

interface GameHeaderProps {
  currentWordIndex: number;
  totalWords: number;
  correctAnswersToday: number;
  onSettingsClick: () => void;
  onLoginClick: () => void;
  onCreateAccountClick: () => void;
}

export function GameHeader({ currentWordIndex, totalWords, correctAnswersToday, onSettingsClick, onLoginClick, onCreateAccountClick }: GameHeaderProps) {
  const { t } = useLanguage();

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
      className="glass rounded-2xl py-2 mb-3 gpu-accelerated overflow-visible"
      {...ANIMATION_VARIANTS.slideDown}
    >
      <div className="max-w-6xl mx-auto px-4 overflow-visible">
        <div className="flex items-center justify-between overflow-visible">
          {/* Logo with KidRead */}
          <motion.div
            className="flex items-center flex-1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-2xl mr-2">📚</span>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
              KidRead
            </h1>
          </motion.div>

          {/* Visual Progress - Icons Only */}
          <motion.div
            className="flex items-center gap-4 justify-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {/* Daily Progress with Stars */}
            <div className="flex items-center gap-2">
              <span className="text-lg">🌟</span>
              <div className="flex items-center gap-1">
                <span className={`text-lg font-bold ${achievementStatus.color}`}>
                  {correctAnswersToday}
                </span>
                <span className="text-sm text-muted-foreground">/</span>
                <span className="text-sm text-muted-foreground">{targetAnswers}</span>
              </div>
              <div className="bg-muted/50 rounded-full h-2 w-16 overflow-hidden">
                <motion.div
                  className={`bg-gradient-to-r ${achievementStatus.bgColor} rounded-full h-2`}
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
                />
              </div>
              {isGoalReached && (
                <motion.span
                  className="text-xl"
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

            {/* Session Progress with Game Icons */}
            {totalWords > 0 && (
              <div className="flex items-center gap-2 border-l border-border/50 pl-4">
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

          {/* Right side: Language Switcher + Profile */}
          <div className="flex items-center gap-2 flex-1 justify-end">
            {/* Language Switcher */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.25 }}
              className="relative overflow-visible"
            >
              <LanguageSwitcher />
            </motion.div>

            {/* Auth Dropdown (includes Settings) */}
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.27 }}
            >
              <AuthDropdown
                onLoginClick={onLoginClick}
                onCreateAccountClick={onCreateAccountClick}
                onSettingsClick={onSettingsClick}
              />
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  );
}
