import { motion } from "framer-motion";
import { useLocation } from "wouter";

// ⚠️ Замените на реальный путь страницы «Свойства сайта»
const SITE_PROPERTIES_PATH = "/?open=site-page";

export function PaymentRequiredNotice({ onClose }: { onClose: () => void }) {
  const [, navigate] = useLocation();

  return (
    <>
      <div onClick={onClose} className="fixed inset-0 bg-black/50 z-[9998]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        role="dialog"
        aria-modal="true"
        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-xl shadow-2xl z-[9999] p-5"
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
    </>
  );
}