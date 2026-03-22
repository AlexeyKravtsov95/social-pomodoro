import { FastifyInstance } from 'fastify';

export async function healthRoutes(fastify: FastifyInstance) {
  // Basic health check
  fastify.get('/', async () => {
    return { 
      status: 'ok', 
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  });
  
  // Database health check
  fastify.get('/db', async () => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      return { 
        status: 'ok', 
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      fastify.log.error('Database health check failed:', error);
      throw error;
    }
  });
  
  // Full health check (for load balancers)
  fastify.get('/ready', async () => {
    try {
      await fastify.prisma.$queryRaw`SELECT 1`;
      return { 
        status: 'ready',
        database: 'connected',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      fastify.log.error('Readiness check failed:', error);
      return { 
        status: 'not_ready',
        database: 'disconnected',
        timestamp: new Date().toISOString(),
      };
    }
  });
}
