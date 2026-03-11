import { z } from 'zod';
import { startFocusSession, finishFocusSession, getActiveSession, } from '../services/sessions.js';
const startSessionSchema = z.object({
    plannedMinutes: z.number().min(5).max(180),
});
const finishSessionSchema = z.object({
    sessionId: z.number(),
});
export const sessionsRoutes = async (fastify) => {
    /**
     * Middleware to extract user from token
     */
    fastify.addHook('preHandler', async (request, reply) => {
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
            request.userId = decoded.userId;
        }
        catch (error) {
            return reply.code(401).send({
                success: false,
                error: 'Invalid token',
            });
        }
    });
    /**
     * GET /sessions/active
     * Gets current active session if any
     */
    fastify.get('/active', async (request, reply) => {
        const userId = request.userId;
        try {
            const session = await getActiveSession(userId);
            if (!session) {
                return {
                    success: true,
                    active: false,
                    session: null,
                };
            }
            const now = new Date();
            const elapsed = Math.floor((now.getTime() - session.startedAt.getTime()) / 1000);
            const remaining = Math.max(0, session.plannedMinutes * 60 - elapsed);
            return {
                success: true,
                active: true,
                session: {
                    id: session.id,
                    plannedMinutes: session.plannedMinutes,
                    elapsedSeconds: elapsed,
                    remainingSeconds: remaining,
                    startedAt: session.startedAt,
                },
            };
        }
        catch (error) {
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                error: 'Failed to get session',
            });
        }
    });
    /**
     * POST /sessions/start
     * Starts a new focus session
     */
    fastify.post('/start', async (request, reply) => {
        const userId = request.userId;
        try {
            const body = startSessionSchema.parse(request.body);
            const result = await startFocusSession(userId, body.plannedMinutes);
            return {
                success: true,
                ...result,
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
            if (error instanceof Error) {
                return reply.code(400).send({
                    success: false,
                    error: error.message,
                });
            }
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                error: 'Failed to start session',
            });
        }
    });
    /**
     * POST /sessions/finish
     * Finishes a focus session
     */
    fastify.post('/finish', async (request, reply) => {
        const userId = request.userId;
        try {
            const body = finishSessionSchema.parse(request.body);
            const result = await finishFocusSession(userId, body.sessionId);
            return {
                success: true,
                ...result,
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
            if (error instanceof Error) {
                return reply.code(400).send({
                    success: false,
                    error: error.message,
                });
            }
            fastify.log.error(error);
            return reply.code(500).send({
                success: false,
                error: 'Failed to finish session',
            });
        }
    });
};
//# sourceMappingURL=sessions.js.map