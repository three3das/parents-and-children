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
      // Мобильные (по умолчанию): flex-col, заголовок сверху / меню
      // снизу (см. justify-between на motion.div ниже), без
      // items-center/justify-center на этом внешнем div. Позиция фона
      // сдвинута влево (bg-[position:35%_center]) — показывает больше
      // Кришны слева, меньше справа. Десктоп (md:): угол в правом
      // верхнем, фон по центру (md:bg-center), как было раньше.
      className="fixed inset-0 z-50 flex flex-col md:flex-row md:items-start md:justify-end bg-black bg-cover bg-[position:30%_center] md:bg-center py-6 md:py-0 md:pt-12 md:pr-8"
      style={{
        backgroundImage: `url(${SPLASH_IMAGE_SRC})`,
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
            className="m-auto text-center px-6"
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
            // Мобильные: h-full + justify-between — заголовок прижат к
            // верху, меню (последний блок) — к низу, центр экрана
            // свободен для картинки. Десктоп (md:): h-auto,
            // justify-start, items-end, text-right — компактный блок в
            // углу, как было.
            className="flex flex-col items-center h-full justify-between gap-3 px-4 max-w-md text-center md:h-auto md:justify-start md:items-end md:text-right md:gap-6 md:px-6"
          >
            <h1 className="text-lg font-bold leading-tight md:text-2xl" style={{ color: GOLD }}>
              <span className="whitespace-nowrap">Сайт «Сознания Кришны»</span>
              <br />
              для тех, кто любит жизнь!
            </h1>

            {/* ⚠️ ПРАВКА: подзаголовок "Начните свое путешествие с
                этого меню!" перенесён внутрь блока с кнопками (сразу
                перед ними), а не отдельным элементом сразу под
                заголовком — теперь он визуально и структурно относится
                к меню, а не к приветственной надписи. */}
            <div className="flex flex-col gap-2 w-full mt-auto md:gap-3 md:mt-0"> 
              
              {SPLASH_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOptionClick(option);
                  }}
                  className="w-full px-4 py-2 rounded-full border-2 font-bold text-sm md:px-5 md:py-3 md:text-base transition bg-white"
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