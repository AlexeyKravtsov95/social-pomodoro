import { z } from 'zod';
import { prisma } from '../db/prisma.js';
import { parseTelegramInitDataUnsafe } from '../services/telegram.js';
const authSchema = z.object({
    initData: z.string(),
});
export const authRoutes = async (fastify) => {
    /**
     * POST /auth/telegram
     * Authenticates user via Telegram WebApp initData
     * Creates user if doesn't exist
     */
    fastify.post('/telegram', async (request, reply) => {
        try {
            const body = authSchema.parse(request.body);
            // Parse initData (validation disabled for MVP - enable in production)
            const isDev = process.env.NODE_ENV === 'development';
            const parsed = isDev
                ? parseTelegramInitDataUnsafe(body.initData)
                : parseTelegramInitDataUnsafe(body.initData); // Replace with validateTelegramInitData in prod
            const { user } = parsed;
            // Find or create user
            let dbUser = await prisma.user.findUnique({
                where: { telegramId: String(user.id) },
            });
            if (!dbUser) {
                dbUser = await prisma.user.create({
                    data: {
                        telegramId: String(user.id),
                        username: user.username,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        photoUrl: user.photo_url,
                        languageCode: user.language_code,
                    },
                });
            }
            else {
                // Update user info if changed
                await prisma.user.update({
                    where: { id: dbUser.id },
                    data: {
                        username: user.username,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        photoUrl: user.photo_url,
                        languageCode: user.language_code,
                    },
                });
            }
            // Generate a simple session token (MVP - use proper JWT in production)
            const token = Buffer.from(JSON.stringify({
                userId: dbUser.id,
                telegramId: dbUser.telegramId,
                iat: Date.now(),
            })).toString('base64');
            return {
                success: true,
                user: {
                    id: dbUser.id,
                    telegramId: dbUser.telegramId,
                    username: dbUser.username,
                    firstName: dbUser.firstName,
                    lastName: dbUser.lastName,
                    photoUrl: dbUser.photoUrl,
                    xp: dbUser.xp,
                    level: dbUser.level,
                    streak: dbUser.streak,
                },
                token,
            };
        }
        catch (error) {
            if (error instanceof z.ZodError) {
                return reply.code(400).send({
                    success: false,
                    error: 'Invalid request',
                    details: error.errors,
                });
            }
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                error: 'Authentication failed',
            });
        }
    });
    /**
     * GET /auth/me
     * Gets current user profile
     */
    fastify.get('/me', async (request, reply) => {
        const authHeader = request.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return reply.code(401).send({
                success: false,
                error: 'Unauthorized',
            });
        }
        try {
            const token = authHeader.substring(7);
            const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: {
                    teamMemberships: {
                        include: {
                            team: true,
                        },
                    },
                },
            });
            if (!user) {
                return reply.code(404).send({
                    success: false,
                    error: 'User not found',
                });
            }
            return {
                success: true,
                user: {
                    id: user.id,
                    telegramId: user.telegramId,
                    username: user.username,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    photoUrl: user.photoUrl,
                    xp: user.xp,
                    level: user.level,
                    streak: user.streak,
                    teams: user.teamMemberships.map((m) => ({
                        teamId: m.team.id,
                        teamName: m.team.name,
                        role: m.role,
                    })),
                },
            };
        }
        catch (error) {
            return reply.code(401).send({
                success: false,
                error: 'Invalid token',
            });
        }
    });
};
//# sourceMappingURL=auth.js.map