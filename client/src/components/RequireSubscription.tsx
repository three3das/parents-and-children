import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";

// Оборачивает защищённые страницы:
//  - не залогинен             → редирект на /login
//  - залогинен, но не оплатил → редирект на /payments
//  - залогинен и оплатил      → показываем страницу как есть
export default function RequireSubscription({
  component: Component,
}: {
  component: React.ComponentType;
}) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isLoading) return; // ждём, пока AuthContext прочитает localStorage

    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    if (!user?.hasSubscription) {
      navigate("/payments");
    }
  }, [isLoading, isAuthenticated, user, navigate]);

  // Пока идёт загрузка или редирект ещё не сработал — ничего не рисуем,
  // чтобы на долю секунды не мигал защищённый контент.
  if (isLoading || !isAuthenticated || !user?.hasSubscription) {
    return null;
  }

  return <Component />;
}