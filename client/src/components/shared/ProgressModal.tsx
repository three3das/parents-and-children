import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

interface ProgressModalProps {
  isOpen: boolean;
  onClose: () => void;
  sessionId: string;
}

export function ProgressModal({ isOpen, onClose, sessionId }: ProgressModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.5, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        className="bg-white rounded-2xl p-6 max-w-md mx-4 max-h-[80vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-primary">
            {t.progress || 'Progress'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          <div className="text-center">
            <p className="text-lg text-gray-600">
              {t.keepPlaying || 'Keep playing to improve your progress!'}
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
