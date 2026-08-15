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
            className="fixed top-[2%] left-1/2 -translate-x-1/2 w-[90%] max-w-md max-h-[96vh] overflow-y-auto bg-white rounded-xl shadow-2xl z-[9999] p-4 mx-auto"
            style={{ transform: 'translateX(-50%)' }}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-[#FFD700] font-bold text-2xl"
            >
              ×
            </button>

            {/* Title */}
            <h2 className="text-lg font-bold text-[#FFD700] font-bold mb-2">
              💳 Оплата подписки
            </h2>

            {/* Amount */}
            <div className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-lg p-2 mb-3">
              <p className="text-white text-xs mb-1">Сумма к оплате:</p>
              <p className="text-white text-xl font-bold">{amount} грн</p>
            </div>

            {/* Card details */}
            <div className="space-y-2 mb-3">
              <div>
                <p className="text-xs text-[#FFD700] font-bold mb-1">Номер карты ПриватБанка:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 bg-gray-100 px-2 py-1 rounded-lg font-mono text-base">
                    {cardNumber}
                  </code>
                  <button
                    onClick={() => copyToClipboard(cardNumber.replace(/\s/g, ""))}
                    className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                  >
                    📋
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-[#FFD700] font-bold mb-1">Получатель:</p>
                <p className="bg-gray-100 px-2 py-1 rounded-lg text-sm">{recipient}</p>
              </div>
            </div>

            {/* Instructions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-3">
              <p className="font-semibold text-blue-900 mb-1 text-xs">📝 Инструкция:</p>
              <ol className="text-xs text-blue-800 space-y-0.5 list-decimal list-inside">
                <li>Переведите <strong>{amount} грн</strong> на карту выше</li>
                <li>После оплаты отправьте письмо на email ниже</li>
                <li>В теме письма укажите: <strong>"Подписка"</strong></li>
                <li>В письме укажите ваш email: <strong>{userEmail}</strong></li>
                <li>Подписка будет активирована в течение 24 часов</li>
              </ol>
            </div>

            {/* Contact email */}
            <div className="mb-3">
              <p className="text-xs text-[#FFD700] font-bold mb-1">Email для подтверждения оплаты:</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 bg-gray-100 px-2 py-1 rounded-lg text-xs break-all">
                  {contactEmail}
                </code>
                <button
                  onClick={() => copyToClipboard(contactEmail)}
                  className="px-2 py-1 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
                >
                  📋
                </button>
              </div>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="w-full mt-2 text-[#FFD700] font-bold py-1 text-xs"
            >
              Закрыть
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
