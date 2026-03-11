import { prisma } from '../db/prisma.js';
export const healthRoutes = async (fastify) => {
    fastify.get('/', async () => {
        return {
            status: 'ok',
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
        };
    });
    fastify.get('/db', async () => {
        try {
            await prisma.$queryRaw `SELECT 1`;
            return {
                status: 'ok',
                database: 'connected',
            };
        }
        catch (error) {
            return {
                status: 'error',
                database: 'disconnected',
                error: 'Database connection failed',
            };
        }
    });
};
//# sourceMappingURL=health.js.map