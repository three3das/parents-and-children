import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: (momentListener?: (notification: any) => void) => void;
        };
      };
    };
  }
}

const GOOGLE_CLIENT_ID =
  import.meta.env.VITE_GOOGLE_CLIENT_ID ||
  '441359935029-your-client-id.apps.googleusercontent.com';

export type GoogleButtonText =
  | 'signin_with'
  | 'signup_with'
  | 'continue_with';

export function useGoogleAuth() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const extraDataRef = useRef<Record<string, any>>({});

  const setExtraData = useCallback((data: Record<string, any>) => {
    extraDataRef.current = data;
  }, []);

  const handleGoogleResponse = useCallback(
    async (response: { credential: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        const res = await fetch('/api/auth/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            credential: response.credential,
            ...extraDataRef.current,
          }),
        });

        const data = await res.json();

        if (res.ok) {
          login(data.user);
          return { success: true, user: data.user };
        } else {
          setError(data.message || 'Failed to authenticate with Google');
          return { success: false, error: data.message };
        }
      } catch (err) {
        const errorMessage = 'Failed to connect to server';
        setError(errorMessage);
        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [login]
  );

  const initializeGoogle = useCallback(() => {
    if (window.google?.accounts?.id) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
        auto_select: false,
        cancel_on_tap_outside: true,
        // ⚠️ ДОБАВЛЕНО: с апреля 2024 Google переводит One Tap/Automatic
        // Sign-In на технологию FedCM (Federated Credential Management) —
        // встроенный в браузер механизм, а не старое всплывающее окно.
        // Без этого флага (на 2026 год, когда переход уже обязателен)
        // окно выбора аккаунта ещё показывается (это рисует браузер по
        // старому пути), но реальный вход после клика по аккаунту тихо
        // обрывается — именно это мы и наблюдали. Подробнее:
        // https://developers.google.com/identity/gsi/web/guides/fedcm-migration
        use_fedcm_for_prompt: true,
      });
    }
  }, [handleGoogleResponse]);

  useEffect(() => {
    const checkGoogleLoaded = setInterval(() => {
      if (window.google) {
        initializeGoogle();
        clearInterval(checkGoogleLoaded);
      }
    }, 100);

    return () => clearInterval(checkGoogleLoaded);
  }, [initializeGoogle]);

  const renderGoogleButton = useCallback(
    (elementId: string, text: GoogleButtonText = 'continue_with') => {
      const element = document.getElementById(elementId);
      if (!element || !window.google?.accounts?.id) return;

      element.innerHTML = '';

      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text,
        shape: 'rectangular',
        width: '100%',
        locale: 'ru',
      });
    },
    []
  );

  const promptGoogleSignIn = useCallback(() => {
    if (window.google?.accounts?.id) {
      // ⚠️ ДОБАВЛЕНО: необязательный колбэк-"слушатель момента" — под
      // FedCM он получает объект notification с методом getMomentType()
      // ('display' | 'skipped' | 'dismissed') и (для 'skipped'/'dismissed')
      // причиной через getSkippedReason()/getDismissedReason(). Раньше
      // colбэка не было вовсе, поэтому при тихом сбое (например,
      // пользователь ранее закрывал окно и Google временно не
      // показывает его снова, либо ограничения куки) в консоли не было
      // вообще никакой подсказки, почему вход не завершается. Теперь
      // причина будет видна в консоли браузера.
      window.google.accounts.id.prompt((notification: any) => {
        try {
          const momentType =
            typeof notification?.getMomentType === 'function'
              ? notification.getMomentType()
              : undefined;
          if (momentType === 'skipped' || momentType === 'dismissed') {
            const reason =
              momentType === 'skipped'
                ? notification.getSkippedReason?.()
                : notification.getDismissedReason?.();
            console.warn(
              `[GoogleAuth] One Tap не завершил вход (${momentType}): ${reason ?? 'причина неизвестна'}`
            );
          }
        } catch (err) {
          console.error('[GoogleAuth] Ошибка чтения notification от prompt():', err);
        }
      });
    }
  }, []);

  return {
    isLoading,
    error,
    renderGoogleButton,
    promptGoogleSignIn,
    handleGoogleResponse,
    initializeGoogle,
    setExtraData,
  };
}