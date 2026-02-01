import { useCallback, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';

// Google Client ID - should be set in environment variable
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || '441359935029-your-client-id.apps.googleusercontent.com';

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: {
            client_id: string;
            callback: (response: { credential: string }) => void;
            auto_select?: boolean;
          }) => void;
          prompt: (notification?: (n: { isNotDisplayed: () => boolean }) => void) => void;
          renderButton: (
            element: HTMLElement,
            config: {
              theme?: 'outline' | 'filled_blue' | 'filled_black';
              size?: 'large' | 'medium' | 'small';
              type?: 'standard' | 'icon';
              text?: 'signin_with' | 'signup_with' | 'continue_with' | 'signin';
              shape?: 'rectangular' | 'pill' | 'circle' | 'square';
              logo_alignment?: 'left' | 'center';
              width?: string;
              locale?: string;
            }
          ) => void;
        };
      };
    };
  }
}

export function useGoogleAuth() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleResponse = useCallback(async (response: { credential: string }) => {
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential: response.credential }),
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
  }, [login]);

  const initializeGoogle = useCallback(() => {
    if (window.google) {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleResponse,
      });
    }
  }, [handleGoogleResponse]);

  useEffect(() => {
    // Initialize Google Sign-In when the script loads
    const checkGoogleLoaded = setInterval(() => {
      if (window.google) {
        initializeGoogle();
        clearInterval(checkGoogleLoaded);
      }
    }, 100);

    // Clean up
    return () => clearInterval(checkGoogleLoaded);
  }, [initializeGoogle]);

  const renderGoogleButton = useCallback((elementId: string) => {
    const element = document.getElementById(elementId);
    if (element && window.google) {
      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        type: 'standard',
        text: 'continue_with',
        shape: 'rectangular',
        width: '100%',
      });
    }
  }, []);

  const promptGoogleSignIn = useCallback(() => {
    if (window.google) {
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
  };
}
