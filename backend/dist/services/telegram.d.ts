import type { TelegramInitDataParsed } from '../types/telegram.js';
/**
 * Validates Telegram WebApp initData signature
 * @see https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app
 */
export declare function validateTelegramInitData(initData: string): TelegramInitDataParsed;
/**
 * Parses initData without validation (for development/debugging)
 */
export declare function parseTelegramInitDataUnsafe(initData: string): TelegramInitDataParsed;
//# sourceMappingURL=telegram.d.ts.map