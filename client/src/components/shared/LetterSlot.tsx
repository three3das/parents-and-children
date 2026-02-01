import { motion } from "framer-motion";

interface LetterSlotProps {
  letter?: string;
  placeholder?: string;
  onClick?: () => void;
  onSpeakerClick?: () => void;
  highlighted?: boolean;
  error?: boolean;
  size?: 'sm' | 'md' | 'lg';
  showSpeaker?: boolean;
}

const sizeClasses = {
  sm: { slot: 'w-12 h-12 text-xl', speaker: 'text-sm h-5' },
  md: { slot: 'w-16 h-16 text-3xl', speaker: 'text-base h-6' },
  lg: { slot: 'w-20 h-20 text-4xl', speaker: 'text-lg h-7' },
};

export function LetterSlot({
  letter,
  placeholder = '?',
  onClick,
  onSpeakerClick,
  highlighted = false,
  error = false,
  size = 'md',
  showSpeaker = false,
}: LetterSlotProps) {
  const baseClasses = `
    ${sizeClasses[size].slot} rounded-xl font-black
    transition-all duration-300 flex items-center justify-center
    border-4
  `;

  const stateClasses = error
    ? 'border-red-500 bg-red-100 text-red-600'
    : letter
      ? highlighted
        ? 'border-green-500 bg-green-100 text-green-700'
        : 'border-blue-500 bg-gray-100 text-black cursor-pointer hover:bg-blue-100'
      : highlighted
        ? 'border-green-500 bg-green-50 border-dashed'
        : 'border-dashed border-gray-400 bg-gray-50 text-gray-400';

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.div
        className={`${baseClasses} ${stateClasses} shadow-lg`}
        onClick={letter && onClick ? onClick : undefined}
        whileHover={letter && onClick ? { scale: 1.05 } : { scale: 1.02 }}
        whileTap={letter && onClick ? { scale: 0.95 } : undefined}
        animate={
          error
            ? { x: [-10, 10, -10, 10, 0], scale: [1, 1.1, 1] }
            : {}
        }
        transition={{ duration: 0.6 }}
      >
        {letter || placeholder}
      </motion.div>

      {showSpeaker && letter && (
        <button
          className={`${sizeClasses[size].speaker} flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors`}
          onClick={(e) => {
            e.stopPropagation();
            onSpeakerClick?.();
          }}
          type="button"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M11.5 3.5c.3-.2.7-.1.9.2l.1.2v16.2c0 .4-.3.7-.7.7-.1 0-.3 0-.4-.1l-4.6-3.4H3.5c-.4 0-.7-.3-.7-.7v-8.2c0-.4.3-.7.7-.7h3.3l4.7-4zm7.1 2.6c2.1 1.5 3.4 4 3.4 6.6s-1.3 5.1-3.4 6.6c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 1.7-1.2 2.8-3.2 2.8-5.5s-1.1-4.3-2.8-5.5c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1zm-2.8 2.8c1.2.9 2 2.3 2 3.8s-.8 2.9-2 3.8c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 .9-.6 1.4-1.6 1.4-2.7s-.5-2.1-1.4-2.7c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1z"/>
          </svg>
        </button>
      )}
      {showSpeaker && !letter && <div className={sizeClasses[size].speaker} />}
    </div>
  );
}
