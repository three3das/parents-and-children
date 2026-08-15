import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from './AuthContext';

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (config: any) => void;
          renderButton: (element: HTMLElement, config: any) => void;
          prompt: () => void;
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
      window.google.accounts.id.prompt();
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