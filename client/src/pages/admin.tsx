import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PendingPayment {
  id: number;
  user_email: string;
  amount: number;
  created_at: string;
  status: string;
}

interface Stats {
  count: number;
  limit: number;
  remaining: number;
  canActivate: boolean;
}

export default function AdminPanel() {
  const [payments, setPayments] = useState<PendingPayment[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [adminEmail] = useState("payments.knowledgechildren@gmail.com");

  const fetchData = async () => {
    try {
      const [paymentsRes, statsRes] = await Promise.all([
        fetch("/api/p2p/pending"),
        fetch("/api/p2p/stats")
      ]);

      const paymentsData = await paymentsRes.json();
      const statsData = await statsRes.json();

      setPayments(paymentsData.payments || []);
      setStats(statsData);
    } catch (err) {
      console.error("Error fetching data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleActivate = async (paymentId: number) => {
    if (!stats?.canActivate) {
      alert("Достигнут лимит активаций на этот месяц (20/20)");
      return;
    }

    if (!confirm("Активировать подписку для этого пользователя?")) {
      return;
    }

    try {
      const res = await fetch("/api/p2p/activate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, adminEmail })
      });

      const data = await res.json();

      if (res.ok) {
        alert("Подписка активирована!");
        fetchData(); // Обновить данные
      } else {
        alert(data.error || "Ошибка активации");
      }
    } catch (err) {
      console.error("Error activating:", err);
      alert("Ошибка активации");
    }
  };

  const handleReject = async (paymentId: number) => {
    const reason = prompt("Причина отклонения (необязательно):");
    if (reason === null) return; // Отменено

    try {
      const res = await fetch("/api/p2p/reject", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ paymentId, reason })
      });

      if (res.ok) {
        alert("Платеж отклонен");
        fetchData();
      } else {
        alert("Ошибка отклонения");
      }
    } catch (err) {
      console.error("Error rejecting:", err);
      alert("Ошибка отклонения");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-[#FFD700] font-bold">Загрузка...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl shadow-lg p-6 mb-6"
        >
          <h1 className="text-3xl font-bold text-[#FFD700] font-bold mb-2">
            📊 Админ-панель подписок
          </h1>
          <p className="text-[#FFD700] font-bold">Управление P2P платежами</p>
        </motion.div>

        {/* Stats */}
        {stats && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={`rounded-xl shadow-lg p-6 mb-6 ${
              stats.canActivate
                ? "bg-gradient-to-r from-green-400 to-blue-500"
                : "bg-gradient-to-r from-red-400 to-orange-500"
            }`}
          >
            <div className="text-white">
              <p className="text-sm mb-1">Активаций в этом месяце:</p>
              <p className="text-4xl font-bold mb-2">
                {stats.count} / {stats.limit}
              </p>
              <p className="text-sm">
                {stats.canActivate
                  ? `Осталось: ${stats.remaining}`
                  : "⚠️ Лимит достигнут! Активации возобновятся 1-го числа следующего месяца"}
              </p>
            </div>
          </motion.div>
        )}

        {/* Payments list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-lg p-6"
        >
          <h2 className="text-xl font-bold text-[#FFD700] font-bold mb-4">
            Ожидают активации ({payments.length})
          </h2>

          {payments.length === 0 ? (
            <p className="text-[#FFD700] font-bold text-center py-8">
              Нет ожидающих платежей
            </p>
          ) : (
            <div className="space-y-4">
              {payments.map((payment, index) => (
                <motion.div
                  key={payment.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="text-[#FFD700] font-bold">
                        {payment.user_email}
                      </p>
                      <p className="text-sm text-[#FFD700] font-bold">
                        Сумма: {payment.amount} грн
                      </p>
                      <p className="text-xs text-[#FFD700] font-bold">
                        Создано: {new Date(payment.created_at).toLocaleString("ru-RU")}
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleActivate(payment.id)}
                        disabled={!stats?.canActivate}
                        className={`px-4 py-2 rounded-lg transition-colors ${ stats?.canActivate ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-300 text-[#FFD700] font-bold cursor-not-allowed" }`}
                      >
                        ✓ Активировать
                      </button>
                      <button
                        onClick={() => handleReject(payment.id)}
                        className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold transition-colors"
                      >
                        ✗ Отклонить
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Instructions */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-6"
        >
          <h3 className="font-bold text-blue-900 mb-2">📝 Инструкция:</h3>
          <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
            <li>Проверьте почту {adminEmail}</li>
            <li>Найдите письмо от клиента с темой "Подписка"</li>
            <li>Проверьте что деньги пришли на карту 4149 6090 1820 1774</li>
            <li>Нажмите "Активировать" для этого email</li>
            <li>Клиент получит доступ мгновенно</li>
          </ol>
        </motion.div>
      </div>
    </div>
  );
}
