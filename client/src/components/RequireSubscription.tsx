import { useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { PaymentRequiredNotice } from "@/components/PaymentRequiredNotice";

// Оборачивает защищённые страницы:
//  - не залогинен             → редирект на /login
//  - залогинен, но не оплатил → окно-уведомление с подсказкой
//  - залогинен и оплатил      → показываем страницу как есть
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
    if (!isAuthenticated) navigate("/login");
  }, [isPending, isAuthenticated, navigate]);

  if (isPending || !isAuthenticated) return null;

  if (!user?.hasSubscription) {
    return <PaymentRequiredNotice onClose={() => navigate("/")} />;
  }

  return <Component />;
}