import { createHmac } from 'crypto';

export interface TelegramInitData {
  user: {
    id: number;
    first_name?: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
  };
  query_id?: string;
  start_param?: string;
  auth_date: number;
  hash: string;
}

/**
 * Validates Telegram WebApp initData
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
 */
export function validateInitData(initData: string, botToken: string): TelegramInitData | null {
  try {
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    
    if (!hash) {
      return null;
    }
    
    // Extract all params except hash
    const dataToCheck: Record<string, string> = {};
    urlParams.forEach((value, key) => {
      if (key !== 'hash') {
        dataToCheck[key] = value;
      }
    });
    
    // Sort params alphabetically
    const sortedParams = Object.entries(dataToCheck)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
    
    // Create data check string
    const secretKey = createHmac('sha256', 'WebAppData')
      .update(botToken)
      .digest();
    
    // Calculate hash
    const calculatedHash = createHmac('sha256', secretKey)
      .update(sortedParams)
      .digest('hex');
    
    // Verify hash
    if (calculatedHash !== hash) {
      return null;
    }
    
    // Check auth_date (valid for 24 hours)
    const authDate = parseInt(dataToCheck['auth_date'], 10);
    const now = Math.floor(Date.now() / 1000);
    const dayInSeconds = 24 * 60 * 60;
    
    if (now - authDate > dayInSeconds) {
      return null;
    }
    
    // Parse user data
    const userJson = dataToCheck['user'];
    if (!userJson) {
      return null;
    }
    
    const user = JSON.parse(userJson);
    
    return {
      user: {
        id: user.id,
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        photo_url: user.photo_url,
      },
      query_id: dataToCheck['query_id'],
      start_param: dataToCheck['start_param'],
      auth_date: authDate,
      hash,
    };
  } catch {
    return null;
  }
}

/**
 * Extracts initData from request headers
 */
export function extractInitDataFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Telegram ')) {
    return null;
  }
  return authHeader.slice('Telegram '.length);
}
