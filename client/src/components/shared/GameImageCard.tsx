import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface GameImageCardProps {
  imagePath: string | null;
  emoji: string | null;
  altText: string;
  isSelected: boolean;
  isCorrect: boolean;
  isDisabled: boolean;
  onClick: () => void;
}

export function GameImageCard({
  imagePath,
  emoji,
  altText,
  isSelected,
  isCorrect,
  isDisabled,
  onClick,
}: GameImageCardProps) {
  const [imageError, setImageError] = useState(false);

  // Reset error state when image changes
  useEffect(() => {
    setImageError(false);
  }, [imagePath]);

  const borderClass = isSelected
    ? isCorrect
      ? "border-4 sm:border-8 border-green-500"
      : "border-4 sm:border-8 border-red-500"
    : "border-2 sm:border-4 border-gray-300 hover:border-blue-500";

  return (
    <motion.div
      onClick={!isDisabled ? onClick : undefined}
      className={`
        w-full rounded-2xl flex items-center justify-center aspect-square overflow-hidden
        ${borderClass}
        ${isDisabled && !isSelected ? "opacity-50 cursor-default" : "cursor-pointer"}
        bg-white transition-colors
      `}
      whileHover={!isSelected && !isDisabled ? { scale: 1.05 } : {}}
      whileTap={!isSelected && !isDisabled ? { scale: 0.95 } : {}}
    >
      <div className="w-full h-full flex items-center justify-center relative overflow-hidden">
        {imagePath && !imageError ? (
          <img
            src={imagePath}
            alt={altText}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className="text-6xl sm:text-8xl">
            {emoji || "🖼️"}
          </span>
        )}
      </div>
    </motion.div>
  );
}
