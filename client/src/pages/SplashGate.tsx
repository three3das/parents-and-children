import { useState } from "react";
import { useSearch } from "wouter";
import { SplashScreen } from "@/components/SplashScreen";
import HomePage from "@/pages/HomePage";

// Точка входа на маршруте "/", вне RequireSubscription. Обычно сначала
// показывает заставку (SplashScreen) — без принудительного требования
// авторизации, чтобы новый посетитель мог увидеть приветствие раньше,
// чем экран входа.
//
// ⚠️ ДОБАВЛЕНО: если в URL передан ?skipSplash=true (используется
// PaymentsPage.tsx сразу после того, как опрос статуса подписки
// обнаружил подтверждение администратора) — заставка пропускается,
// и сразу показывается HomePage с колесом. Это нужно, чтобы только что
// одобренный пользователь не упирался повторно в приветственный экран
// "Сайт приветствует Вас!" сразу после того, как уже прошёл весь путь
// регистрации и оплаты.
export default function SplashGate() {
  const search = useSearch();
  const skipSplash = new URLSearchParams(search).get("skipSplash") === "true";

  const [dismissed, setDismissed] = useState(skipSplash);
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