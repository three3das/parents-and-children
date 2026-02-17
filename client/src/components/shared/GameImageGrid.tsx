import { useMemo } from "react";
import { motion } from "framer-motion";
import { ANIMATION_VARIANTS } from "@/lib/constants";

interface GameImageGridProps {
  children: React.ReactNode;
  itemCount: number;
}

export function GameImageGrid({ children, itemCount }: GameImageGridProps) {
  const gridClasses = useMemo(() => {
    if (itemCount <= 2) return "grid-cols-1 sm:grid-cols-2";
    if (itemCount <= 4) return "grid-cols-2 sm:grid-cols-4";
    return "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4";
  }, [itemCount]);

  return (
    <motion.div
      className={`grid ${gridClasses} gap-2 sm:gap-4 max-w-[350px] sm:max-w-7xl mx-auto`}
      {...ANIMATION_VARIANTS.stagger}
    >
      {children}
    </motion.div>
  );
}
