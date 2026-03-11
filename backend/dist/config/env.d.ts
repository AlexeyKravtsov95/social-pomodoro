import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
    DATABASE_URL: z.ZodString;
    TELEGRAM_BOT_TOKEN: z.ZodOptional<z.ZodString>;
    TELEGRAM_WEB_APP_URL: z.ZodOptional<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    PORT: string;
    NODE_ENV: "development" | "production" | "test";
    DATABASE_URL: string;
    TELEGRAM_BOT_TOKEN?: string | undefined;
    TELEGRAM_WEB_APP_URL?: string | undefined;
}, {
    DATABASE_URL: string;
    PORT?: string | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
    TELEGRAM_BOT_TOKEN?: string | undefined;
    TELEGRAM_WEB_APP_URL?: string | undefined;
}>;
export type Env = z.infer<typeof envSchema>;
export declare const env: {
    PORT: string;
    NODE_ENV: "development" | "production" | "test";
    DATABASE_URL: string;
    TELEGRAM_BOT_TOKEN?: string | undefined;
    TELEGRAM_WEB_APP_URL?: string | undefined;
};
export {};
//# sourceMappingURL=env.d.ts.map