import { createContext, useContext, useState, useEffect, useCallback, useRef, type ReactNode } from 'react';
import type { User, AuthState } from './types';

const STORAGE_KEY = 'parents.and.children-auth';

interface AuthContextType extends AuthState {
  login: (user: User) => void;
  register: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isSyncing: false,
  });

  // true, если пользователь успел войти/выйти, пока шла сверка статуса —
  // тогда результат сверки уже не нужен.
  const touchedRef = useRef(false);

  // При открытии сайта: читаем пользователя из localStorage и сразу
  // сверяем hasSubscription с сервером (GET /api/auth/status/:userId).
  // Раньше статус записывался только при входе и потом не обновлялся,
  // поэтому после активации подписки в админке устройство продолжало
  // считать, что подписки нет, и отправляло на /payments.
  useEffect(() => {
    async function init() {
      let stored: User | null = null;
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) stored = JSON.parse(raw) as User;
      } catch (error) {
        console.error('Error loading auth state:', error);
      }

      if (!stored) {
        setState({ user: null, isAuthenticated: false, isLoading: false, isSyncing: false });
        return;
      }

      // Показываем сохранённого пользователя, но RequireSubscription
      // ждёт, пока isSyncing не станет false.
      setState({ user: stored, isAuthenticated: true, isLoading: false, isSyncing: true });

      try {
        const res = await fetch(`/api/auth/status/${stored.id}`);
        if (res.ok) {
          const data = await res.json();
          const hasSubscription = !!data.hasSubscription;
          if (!touchedRef.current && hasSubscription !== stored.hasSubscription) {
            const updated: User = { ...stored, hasSubscription };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
            setState((prev) => ({ ...prev, user: updated }));
          }
        }
      } catch (error) {
        // Нет сети — остаёмся на сохранённом значении.
        console.error('Не удалось обновить статус подписки:', error);
      } finally {
        setState((prev) => ({ ...prev, isSyncing: false }));
      }
    }

    init();
  }, []);

  const saveAndSet = useCallback((user: User) => {
    touchedRef.current = true;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    setState({ user, isAuthenticated: true, isLoading: false, isSyncing: false });
  }, []);

  const login = saveAndSet;
  const register = saveAndSet;

  const logout = useCallback(() => {
    touchedRef.current = true;
    localStorage.removeItem(STORAGE_KEY);
    setState({ user: null, isAuthenticated: false, isLoading: false, isSyncing: false });
  }, []);

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}