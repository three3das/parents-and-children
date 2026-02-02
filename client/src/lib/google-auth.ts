import { useState, useRef, useEffect } from 'react';
import { useAuth } from './auth';

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

export function useGoogleAuth() {
  const { login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const renderGoogleButton = (elementId: string) => {
    if (!window.google?.accounts?.id) {
      console.error('Google Sign-In library not loaded');
      return;
    }

    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID || 'YOUR_GOOGLE_CLIENT_ID',
      callback: async (response: any) => {
        setIsLoading(true);
        try {
          // Отправляем credential на сервер
          const res = await fetch('/api/auth/google', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ credential: response.credential })
          });

          const data = await res.json();
          if (res.ok) {
            login(data.user);
          } else {
            console.error('Google auth error:', data.message);
          }
        } catch (error) {
          console.error('Google auth error:', error);
        } finally {
          setIsLoading(false);
        }
      },
      auto_select: false,
      cancel_on_tap_outside: true,
    });

    // Рендерим кнопку
    const element = document.getElementById(elementId);
    if (element) {
      // Очищаем элемент перед рендером
      element.innerHTML = '';

      window.google.accounts.id.renderButton(element, {
        theme: 'outline',
        size: 'large',
        width: '100%',
        text: 'signin_with', // Изменено на signin_with для входа
        locale: 'ru'
      });
    }
  };

  return { renderGoogleButton, isLoading };
}
