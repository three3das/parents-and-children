import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LanguageScriptMenuPanel } from "@/components/LanguageScriptMenuPanel";

// пути к изображению и аудио файлу
const SPLASH_IMAGE_SRC = "/images/krishna.jpg";
const SPLASH_AUDIO_SRC = "/audio/krishna.mp3";

const GOLD = "#FFD700";

interface SplashOption {
  key: string;
  label: string;
}

const SPLASH_OPTIONS: SplashOption[] = [
  { key: "all-data", label: "Познавательное, для начинающих" },
  { key: "your-page", label: "Ваша страница" },
  { key: "site-page", label: "Все страницы сайта" },
  { key: "languages", label: "Меню" },
];

interface SplashScreenProps {
  onSelect: (key: string) => void;
  onDismiss: () => void;
}

export function SplashScreen({ onSelect, onDismiss }: SplashScreenProps) {
  const [tapped, setTapped] = useState(false);
  const [fadingOut, setFadingOut] = useState(false);
  const [showLanguagePanel, setShowLanguagePanel] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  function handleTap() {
    if (tapped) return;
    setTapped(true);
    try {
      const audio = new Audio(SPLASH_AUDIO_SRC);
      audio.loop = true;
      audio.volume = 1;
      audioRef.current = audio;
      audio.play().catch((err) => console.error("Ошибка воспроизведения заставки:", err));
    } catch (err) {
      console.error("Ошибка создания аудио заставки:", err);
    }
  }

  function fadeOutAudio(): Promise<void> {
    return new Promise((resolve) => {
      const audio = audioRef.current;
      if (!audio) {
        resolve();
        return;
      }
      const steps = 12;
      const stepDuration = 600 / steps;
      let currentStep = 0;
      const startVolume = audio.volume;
      const interval = setInterval(() => {
        currentStep += 1;
        audio.volume = Math.max(0, startVolume * (1 - currentStep / steps));
        if (currentStep >= steps) {
          clearInterval(interval);
          audio.pause();
          resolve();
        }
      }, stepDuration);
    });
  }

  async function handleOptionClick(option: SplashOption) {
    if (fadingOut) return;

    if (option.key === "languages") {
      setShowLanguagePanel((open) => !open);
      onSelect(option.key);
      return;
    }

    setFadingOut(true);
    await fadeOutAudio();
    onSelect(option.key);
    onDismiss();
  }

  return (
    <div
      // ⚠️ ПРАВКА (адаптивность): на мобильных экранах (по умолчанию,
      // до md/768px) блок остаётся по центру, как было изначально —
      // в углу на маленьком экране кнопки было бы трудно нажимать
      // пальцем и часть текста могла обрезаться. От md: и шире
      // (планшеты/десктоп) блок смещается в правый верхний угол.
      className="fixed inset-0 z-50 flex items-center justify-center md:items-start md:justify-end bg-black md:pt-12 md:pr-8"
      style={{
        backgroundImage: `url(${SPLASH_IMAGE_SRC})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
      onClick={!tapped ? handleTap : undefined}
    >
      <AnimatePresence>
        {!tapped && (
          <motion.div
            key="tap-prompt"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center px-6"
          >
            <p className="text-xl font-bold animate-pulse" style={{ color: GOLD }}>
              Нажмите, чтобы войти
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {tapped && (
          <motion.div
            key="greeting"
            initial={{ opacity: 0 }}
            animate={{ opacity: fadingOut ? 0 : 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            // ⚠️ ПРАВКА (адаптивность): на мобильных — items-center и
            // text-center (текст/кнопки центрированы внутри блока, как
            // было изначально). От md: — items-end и text-right
            // (прижаты к правому краю, для варианта "в углу").
            className="flex flex-col items-center gap-6 px-6 max-w-md text-center md:items-end md:text-right"
          >
            <h1 className="text-2xl font-bold leading-tight" style={{ color: GOLD }}>
              <span className="whitespace-nowrap">Сайт «Сознания Кришны»</span>
              <br />
              для тех, кто любит жизнь
            </h1>
            <p className="text-lg" style={{ color: GOLD }}>
              Начните свое путешествие с этого меню!
            </p>

            <div className="flex flex-col gap-3 w-full">
              {SPLASH_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionClick(option);
                  }}
                  className="w-full px-5 py-3 rounded-full border-2 font-bold text-base transition bg-white"
                  style={{ color: GOLD, borderColor: GOLD }}
                >
                  {option.label}
                </button>
              ))}
            </div>

            {showLanguagePanel && (
              <div
                className="mt-2 w-64 rounded-2xl border-2 bg-white shadow-lg overflow-hidden"
                style={{ borderColor: GOLD }}
                onClick={(e) => e.stopPropagation()}
              >
                <LanguageScriptMenuPanel />
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}