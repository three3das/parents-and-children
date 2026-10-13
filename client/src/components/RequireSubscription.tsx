import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

// Оборачивает защищённые страницы:
//  - не залогинен             → редирект на /login
//  - залогинен, но не оплатил → редирект на /payments
//  - залогинен и оплатил      → показываем страницу как есть
//
// Решение принимается только когда AuthContext прочитал localStorage
// (isLoading) и сверил статус подписки с сервером (isSyncing).
export default function RequireSubscription({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, isAuthenticated, isLoading, isSyncing } = useAuth();
  const [, navigate] = useLocation();

  const isPending = isLoading || isSyncing;

  useEffect(() => {
    if (isPending) return;

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!user?.hasSubscription) {
      navigate("/payments");
    }
  }, [isPending, isAuthenticated, user, navigate]);

  // Пока идёт загрузка или редирект ещё не сработал — ничего не рисуем,
  // чтобы защищённый контент не мелькал.
  if (isPending || !isAuthenticated || !user?.hasSubscription) {
    return null;
  }

  return <Component />;
}