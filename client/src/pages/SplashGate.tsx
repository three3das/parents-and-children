import { useState } from "react";
import { SplashScreen } from "@/components/SplashScreen";
import HomePage from "@/pages/HomePage";

// Точка входа на маршруте "/", вне RequireSubscription. Сначала
// показывает заставку (SplashScreen) — без принудительного требования
// авторизации, чтобы новый посетитель мог увидеть приветствие раньше,
// чем экран входа. После выбора одной из 4 кнопок заставки —
// передаёт выбранный ключ в HomePage, которая сама выполняет тот же
// переход, что и одноимённая кнопка футера (через handleFooterClick).
export default function SplashGate() {
  const [dismissed, setDismissed] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | undefined>(undefined);

  if (!dismissed) {
    return (
      <SplashScreen
        onSelect={(key) => setPendingKey(key)}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  return <HomePage initialFooterKey={pendingKey} />;
}