import { useState } from "react";
import { useLocation, useSearch } from "wouter";
import { SplashScreen } from "@/components/SplashScreen";
import HomePage from "@/pages/HomePage";

// Точка входа на маршруте "/", вне RequireSubscription. Обычно сначала
// показывает заставку (SplashScreen) — без принудительного требования
// авторизации, чтобы новый посетитель мог увидеть приветствие раньше,
// чем экран входа.
//
// ?skipSplash=true (используется PaymentsPage.tsx после подтверждения
// подписки) — заставка пропускается, сразу показывается HomePage.
//
// ⚠️ ДОБАВЛЕНО: ?open=<ключ кнопки футера> (например, open=site-page,
// его использует PaymentRequiredNotice) — заставка тоже пропускается,
// а ключ передаётся в HomePage как initialFooterKey. HomePage выполняет
// тот же handleFooterClick, что и при обычном клике, поэтому
// открывается нужное колесо («Свойства сайта»).
export default function SplashGate() {
  const [, navigate] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const skipSplash = params.get("skipSplash") === "true";
  const openKey = params.get("open") || undefined;

  const [dismissed, setDismissed] = useState(skipSplash || !!openKey);
  const [pendingKey, setPendingKey] = useState<string | undefined>(openKey);

  if (!dismissed) {
    return (
      <SplashScreen
        onSelect={(key) => {
          // «Регистрация и авторизация» ведёт на отдельную страницу /auth
          // (формы регистрации и входа), а не на колесо.
          if (key === "auth") {
            navigate("/auth");
            return;
          }
          setPendingKey(key);
        }}
        onDismiss={() => setDismissed(true)}
      />
    );
  }

  return <HomePage initialFooterKey={pendingKey} />;
}