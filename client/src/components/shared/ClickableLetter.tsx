import { motion } from "framer-motion";

interface ClickableLetterProps {
  letter: string;
  onClick: () => void;
  onSpeakerClick?: () => void;
  selected?: boolean;
  disabled?: boolean;
  used?: boolean;
  theme?: 'blue' | 'purple' | 'gray' | 'green' | 'red';
  size?: 'sm' | 'md' | 'lg';
  showSpeaker?: boolean;
}

const themeClasses = {
  blue: 'bg-blue-500 text-white hover:bg-blue-600 border-blue-500',
  purple: 'bg-gradient-to-br from-purple-400 to-pink-400 text-white hover:from-purple-500 hover:to-pink-500 border-purple-400',
  gray: 'bg-white text-gray-800 hover:bg-gray-50 border-gray-300',
  green: 'bg-green-500 text-white hover:bg-green-600 border-green-500',
  red: 'bg-red-500 text-white hover:bg-red-600 border-red-500',
};

const selectedClasses = {
  blue: 'ring-4 ring-blue-300 scale-110 bg-blue-600',
  purple: 'ring-4 ring-purple-300 scale-110',
  gray: 'ring-4 ring-gray-400 scale-110 bg-gray-100',
  green: 'ring-4 ring-green-300 scale-110 bg-green-600',
  red: 'ring-4 ring-red-300 scale-110 bg-red-600',
};

const sizeClasses = {
  sm: { letter: 'w-12 h-12 text-xl', speaker: 'text-sm h-5' },
  md: { letter: 'w-16 h-16 text-3xl', speaker: 'text-base h-6' },
  lg: { letter: 'w-20 h-20 text-4xl', speaker: 'text-lg h-7' },
};

export function ClickableLetter({
  letter,
  onClick,
  onSpeakerClick,
  selected = false,
  disabled = false,
  used = false,
  theme = 'blue',
  size = 'md',
  showSpeaker = false,
}: ClickableLetterProps) {
  if (used) {
    return (
      <div className="flex flex-col items-center">
        <div
          className={`${sizeClasses[size].letter} rounded-xl`}
          style={{ visibility: 'hidden' }}
        />
        {showSpeaker && <div className={sizeClasses[size].speaker} />}
      </div>
    );
  }

  const baseClasses = `
    ${sizeClasses[size].letter} rounded-xl font-bold
    transition-all duration-200 cursor-pointer select-none shadow-lg
    flex items-center justify-center border-2
  `;

  const stateClasses = disabled
    ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200'
    : selected
      ? `${themeClasses[theme]} ${selectedClasses[theme]}`
      : themeClasses[theme];

  return (
    <div className="flex flex-col items-center gap-1">
      <motion.button
        className={`${baseClasses} ${stateClasses}`}
        onClick={disabled ? undefined : onClick}
        whileHover={!disabled ? { scale: selected ? 1.1 : 1.05 } : undefined}
        whileTap={!disabled ? { scale: 0.95 } : undefined}
        disabled={disabled}
        type="button"
      >
        {letter}
      </motion.button>

      {showSpeaker && (
        <button
          className={`${sizeClasses[size].speaker} flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors`}
          onClick={(e) => {
            e.stopPropagation();
            onSpeakerClick?.();
          }}
          type="button"
          disabled={disabled}
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M11.5 3.5c.3-.2.7-.1.9.2l.1.2v16.2c0 .4-.3.7-.7.7-.1 0-.3 0-.4-.1l-4.6-3.4H3.5c-.4 0-.7-.3-.7-.7v-8.2c0-.4.3-.7.7-.7h3.3l4.7-4zm7.1 2.6c2.1 1.5 3.4 4 3.4 6.6s-1.3 5.1-3.4 6.6c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 1.7-1.2 2.8-3.2 2.8-5.5s-1.1-4.3-2.8-5.5c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1zm-2.8 2.8c1.2.9 2 2.3 2 3.8s-.8 2.9-2 3.8c-.3.2-.7.2-1-.1-.2-.3-.2-.7.1-1 .9-.6 1.4-1.6 1.4-2.7s-.5-2.1-1.4-2.7c-.3-.2-.4-.7-.1-1 .2-.3.7-.3 1-.1z"/>
          </svg>
        </button>
      )}
    </div>
  );
}
