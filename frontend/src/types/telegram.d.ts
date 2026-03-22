/// <reference types="vite/client" />

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

interface TelegramWebApp {
  initData: string;
  initDataUnsafe: {
    user?: TelegramUser;
    query_id?: string;
    start_param?: string;
  };
  version: string;
  platform: string;
  colorScheme: string;
  themeParams: Record<string, string>;
  isExpanded: boolean;
  viewportHeight: number;
  viewportStableHeight: number;
  headerColor: string;
  backgroundColor: string;
  isClosingConfirmationEnabled: boolean;
  isVerticalSwipesEnabled: boolean;
  isThemeParamsChanged: boolean;
  
  ready(): void;
  expand(): void;
  close(): void;
  showPopup(params: any): void;
  showAlert(message: string): void;
  showConfirm(message: string): void;
  HapticFeedback: {
    impactOccurred(style: string): void;
    notificationOccurred(type: string): void;
    selectionChanged(): void;
  };
  onEvent(event: string, callback: (...args: any[]) => void): void;
  offEvent(event: string, callback: (...args: any[]) => void): void;
}

interface Window {
  Telegram?: {
    WebApp: TelegramWebApp;
  };
}
