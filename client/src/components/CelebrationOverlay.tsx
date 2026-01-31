import { motion, AnimatePresence } from "framer-motion";
import { useAudio } from "@/hooks/useAudio";
import { useEffect, useRef, useMemo } from "react";
import { GAME_CONFIG, ANIMATION_VARIANTS } from "@/lib/constants";
import { useLanguage } from "@/lib/i18n";

interface CelebrationOverlayProps {
  isVisible: boolean;
  onNext: () => void;
}

interface ParticleProps {
  delay: number;
  x: number;
  y: number;
  color: string;
  size: string;
}

function Particle({ delay, x, y, color, size }: ParticleProps) {
  return (
    <motion.div
      className="particle absolute pointer-events-none select-none"
      style={{ 
        left: x, 
        top: y,
        fontSize: size,
        color
      }}
      initial={{ scale: 0, rotate: 0, opacity: 0 }}
      animate={{ 
        scale: [0, 1.5, 0],
        rotate: [0, 180, 360],
        opacity: [0, 1, 0],
        y: [0, -200, -400],
        x: [0, Math.random() * 100 - 50]
      }}
      transition={{ 
        duration: 2,
        delay,
        ease: "easeOut"
      }}
    >
      ⭐
    </motion.div>
  );
}

function Confetti({ delay }: { delay: number }) {
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#f9ca24', '#f0932b', '#eb4d4b', '#6c5ce7'];
  const shapes = ['●', '▲', '■', '♦'];
  
  return (
    <motion.div
      className="absolute pointer-events-none"
      style={{
        left: Math.random() * window.innerWidth,
        top: -20,
        color: colors[Math.floor(Math.random() * colors.length)],
        fontSize: Math.random() * 20 + 10
      }}
      initial={{ y: -20, rotate: 0, opacity: 1 }}
      animate={{ 
        y: window.innerHeight + 20,
        rotate: Math.random() * 720 - 360,
        opacity: [1, 1, 0]
      }}
      transition={{ 
        duration: Math.random() * 2 + 3,
        delay,
        ease: "easeIn"
      }}
    >
      {shapes[Math.floor(Math.random() * shapes.length)]}
    </motion.div>
  );
}

export function CelebrationOverlay({ isVisible, onNext }: CelebrationOverlayProps) {
  const { playApplause } = useAudio();
  const { t } = useLanguage();
  const hasPlayedSound = useRef(false);

  // Memoize celebration message to prevent re-renders
  const celebrationMessage = useMemo(() => {
    return t.celebrations[Math.floor(Math.random() * t.celebrations.length)];
  }, [isVisible, t.celebrations]);

  // Memoize particles to prevent recreation on every render
  const particles = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({
      key: i,
      delay: i * 0.1,
      x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 800),
      y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 600),
      color: ['#ffd700', '#ff69b4', '#00ced1', '#ff6347', '#9370db'][Math.floor(Math.random() * 5)],
      size: `${Math.random() * 30 + 20}px`
    }));
  }, [isVisible]);

  const confettiPieces = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      key: `confetti-${i}`,
      delay: Math.random() * 0.5
    }));
  }, [isVisible]);

  useEffect(() => {
    if (isVisible) {
      if (!hasPlayedSound.current) {
        playApplause();
        hasPlayedSound.current = true;
      }
      
      const timer = setTimeout(() => {
        onNext();
      }, GAME_CONFIG.celebrationDuration);
      
      return () => clearTimeout(timer);
    } else {
      hasPlayedSound.current = false;
    }
  }, [isVisible, playApplause, onNext]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="celebration-particles-only gpu-accelerated"
          {...ANIMATION_VARIANTS.fadeIn}
        >
          {/* Confetti */}
          {confettiPieces.map(({ key, delay }) => (
            <Confetti key={key} delay={delay} />
          ))}
          
          {/* Star particles */}
          {particles.map(({ key, delay, x, y, color, size }) => (
            <Particle 
              key={key} 
              delay={delay} 
              x={x} 
              y={y} 
              color={color} 
              size={size}
            />
          ))}

        </motion.div>
      )}
    </AnimatePresence>
  );
}