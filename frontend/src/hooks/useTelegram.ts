import { useEffect, useState } from 'react';

declare global {
  interface Window {
    Telegram?: {
      WebApp: {
        initData: string;
        initDataUnsafe?: {
          user?: {
            id: number;
            first_name?: string;
            last_name?: string;
            username?: string;
            language_code?: string;
            photo_url?: string;
          };
        };
        ready: () => void;
        expand: () => void;
        themeParams: Record<string, string>;
        colorScheme: 'light' | 'dark';
      };
    };
  }
}

export function useTelegram() {
  const [isReady, setIsReady] = useState(false);
  const [initData, setInitData] = useState<string>('');
  const [user, setUser] = useState<{
    id: number;
    firstName?: string;
    lastName?: string;
    username?: string;
    languageCode?: string;
    photoUrl?: string;
  } | null>(null);

  useEffect(() => {
    const tg = window.Telegram?.WebApp;
    
    if (tg) {
      // Signal that the app is ready
      tg.ready();
      tg.expand();
      
      // Get init data
      const data = tg.initData;
      setInitData(data);
      
      // Get user info
      const userData = tg.initDataUnsafe?.user;
      if (userData) {
        setUser({
          id: userData.id,
          firstName: userData.first_name,
          lastName: userData.last_name,
          username: userData.username,
          languageCode: userData.language_code,
          photoUrl: userData.photo_url,
        });
      }
      
      setIsReady(true);
    } else {
      // Not running in Telegram - development mode
      console.log('Telegram WebApp not available - development mode');
      setIsReady(true);
    }
  }, []);

  return {
    isReady,
    initData,
    user,
    isInTelegram: !!window.Telegram?.WebApp,
    themeParams: window.Telegram?.WebApp?.themeParams || {},
    colorScheme: window.Telegram?.WebApp?.colorScheme || 'light',
  };
}
