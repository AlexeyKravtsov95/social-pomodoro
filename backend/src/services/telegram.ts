import { createHmac } from 'crypto';
import type { TelegramInitDataParsed } from '../types/telegram.js';
import { env } from '../config/env.js';

/**
 * Validates Telegram WebApp initData signature
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export function validateTelegramInitData(initData: string): TelegramInitDataParsed {
  const params = new URLSearchParams(initData);
  const hash = params.get('hash');
  
  if (!hash) {
    throw new Error('Missing hash in initData');
  }
  
  // Remove hash from params for signature calculation
  params.delete('hash');
  
  // Sort params alphabetically by key
  const sortedParams = Array.from(params.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  
  // Calculate signature
  if (!env.TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN not configured');
  }
  
  const secretKey = createHmac('sha256', 'WebAppData')
    .update(env.TELEGRAM_BOT_TOKEN)
    .digest();
  
  const calculatedHash = createHmac('sha256', secretKey)
    .update(sortedParams)
    .digest('hex');
  
  if (calculatedHash !== hash) {
    throw new Error('Invalid initData signature');
  }
  
  // Parse user data
  const userParam = params.get('user');
  if (!userParam) {
    throw new Error('Missing user in initData');
  }
  
  const user = JSON.parse(userParam);
  const authDate = parseInt(params.get('auth_date') || '0', 10);
  
  // Check if data is not older than 24 hours (for security)
  const now = Math.floor(Date.now() / 1000);
  if (now - authDate > 24 * 60 * 60) {
    throw new Error('InitData is too old');
  }
  
  return {
    user,
    authDate,
    hash,
    queryId: params.get('queryId') || undefined,
    startParam: params.get('start_param') || undefined,
  };
}

/**
 * Parses initData without validation (for development/debugging)
 */
export function parseTelegramInitDataUnsafe(initData: string): TelegramInitDataParsed {
  const params = new URLSearchParams(initData);
  const userParam = params.get('user');
  
  if (!userParam) {
    throw new Error('Missing user in initData');
  }
  
  const user = JSON.parse(userParam);
  const authDate = parseInt(params.get('auth_date') || '0', 10);
  const hash = params.get('hash') || '';
  
  return {
    user,
    authDate,
    hash,
    queryId: params.get('queryId') || undefined,
    startParam: params.get('start_param') || undefined,
  };
}
