import { motion, AnimatePresence } from "framer-motion";

interface P2PPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail: string;
}

export function P2PPaymentModal({ isOpen, onClose, userEmail }: P2PPaymentModalProps) {
  const cardNumber = "4149 6090 1820 1774";
  const recipient = "Урiзко Олександр Леонiдович";
  const amount = "100";
  const contactEmail = "payments.knowledgechildren@gmail.com";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Скопировано!");
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-[9998]"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-md bg-white rounded-2xl shadow-2xl z-[9999] p-6"
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>

            {/* Title */}
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
              💳 Оплата подписки
            </h2>

            {/* Amount */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-xl p-4 mb-6">
              <p className="text-white text-sm mb-1">Сумма к оплате:</p>
              <p className="text-white text-3xl font-bold">{amount} грн</p>
            </div>

            {/* Card details */}
            <div className="space-y-4 mb-6">
              <div>
                <p className="text-sm text-gray-600 mb-1">Номер карты ПриватБанка:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-3 py-2 rounded-lg font-mono text-lg">
                    {cardNumber}
                  </code>
                  <button
                    onClick={() => copyToClipboard(cardNumber.replace(/\s/g, ""))}
                    className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div>
                <p className="text-sm text-gray-600 mb-1">Получатель:</p>
                <p className="bg-gray-100 px-3 py-2 rounded-lg">{recipient}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
              <p className="font-semibold text-blue-900 mb-2">📝 Инструкция:</p>
              <ol className="text-sm text-blue-800 space-y-2 list-decimal list-inside">
                <li>Переведите <strong>{amount} грн</strong> на карту выше</li>
                <li>После оплаты отправьте письмо на <strong>{contactEmail}</strong></li>
                <li>В теме письма укажите: <strong>"Подписка"</strong></li>
                <li>В письме укажите ваш email: <strong>{userEmail}</strong></li>
                <li>Подписка будет активирована в течение 24 часов</li>
              </ol>
            </div>

            {/* Email template button */}
            <a
              href={`mailto:${contactEmail}?subject=Подписка&body=Здравствуйте!%0A%0AОплатил(а) подписку на сумму ${amount} грн.%0AMой email: ${userEmail}%0A%0AСпасибо!`}
              className="block w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-xl text-center transition-colors"
            >
              ✉️ Отправить письмо
            </a>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full mt-3 text-gray-600 hover:text-gray-800 py-2"
            >
              Закрыть
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
