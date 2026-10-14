import { motion } from "framer-motion";
import { useLocation } from "wouter";

// Путь на главную с открытием колеса «Свойства сайта»
// (обрабатывается в SplashGate.tsx через параметр open).
const SITE_PROPERTIES_PATH = "/?open=site-page";

export function PaymentRequiredNotice({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      {/* Затемнение; клик по нему закрывает окно */}
      <div onClick={onClose} className="absolute inset-0 bg-black/50" />

      {/* Само окно: центрируется обёрткой, поэтому анимация его не сдвигает */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative w-full max-w-md max-h-[90vh] overflow-y-auto bg-white rounded-xl shadow-2xl p-5"
      >
        <h2 className="text-lg font-bold text-[#FFD700] mb-2">
          Доступ открывается после оплаты
        </h2>
        <p className="text-sm text-gray-700 mb-3">
          Пользование сервисом предоставляется с момента оплаты. Чтобы узнать,
          как это сделать:
        </p>
        <ol className="text-sm text-gray-700 list-decimal list-inside space-y-1 mb-4">
          <li>Перейдите на страницу «Свойства сайта».</li>
          <li>Нажмите на колесе кнопку «Узнать возможности сайта».</li>
          <li>Следуйте подсказкам, там же описаны способы оплаты.</li>
        </ol>
        <button
          onClick={() => navigate(SITE_PROPERTIES_PATH)}
          className="w-full py-2 rounded-lg bg-[#FFD700] text-white font-bold mb-2"
        >
          Перейти в «Свойства сайта»
        </button>
        <button
          onClick={onClose}
          className="w-full py-1 text-sm text-[#FFD700] font-bold"
        >
          Закрыть
        </button>
      </motion.div>
    </div>
  );
}