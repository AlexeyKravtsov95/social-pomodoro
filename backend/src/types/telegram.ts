// Telegram WebApp InitData types
export interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
  photo_url?: string;
}

export interface TelegramInitData {
  user?: TelegramUser;
  chat?: {
    id: number;
    type: 'group' | 'supergroup' | 'channel';
    title?: string;
    username?: string;
  };
  auth_date: number;
  hash: string;
  query_id?: string;
  start_param?: string;
}

export interface TelegramInitDataParsed {
  user: TelegramUser;
  authDate: number;
  hash: string;
  queryId?: string;
  startParam?: string;
}
