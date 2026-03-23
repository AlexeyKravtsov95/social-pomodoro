import Fastify from 'fastify';
import cors from '@fastify/cors';
import { loadEnv } from './config/env.js';
import { registerRoutes } from './routes/index.js';
import { prisma, disconnectPrisma } from './lib/prisma.js';
import { setupWeeklyReset, setupDailyQuestReset } from './lib/cron.js';

const env = loadEnv();

const fastify = Fastify({
  logger: env.NODE_ENV === 'development' ? {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'SYS:standard',
      },
    },
    level: 'debug',
  } : true,
  trustProxy: true,
});

// Attach env and prisma to fastify instance
fastify.decorate('env', env);
fastify.decorate('prisma', prisma);

// Register global CORS handler - MUST be before routes
fastify.options('*', async (request, reply) => {
  reply.send();
});

// Register CORS for frontend
await fastify.register(cors, {
  origin: true, // Allow all origins for now
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
});

// Register routes
await registerRoutes(fastify);

// Graceful shutdown
const shutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`);
  await fastify.close();
  await disconnectPrisma();
  process.exit(0);
};

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));

// Start server
try {
  const port = parseInt(env.PORT || '3000', 10);
  const host = '0.0.0.0';
  
  await fastify.listen({
    port,
    host
  });
  
  fastify.log.info(`🚀 Server running on port ${port}`);
  fastify.log.info(`📡 Listening on ${host}:${port}`);
  
  // Setup cron jobs after server starts
  const weeklyReset = setupWeeklyReset(prisma);
  const dailyQuestReset = setupDailyQuestReset(prisma);
  
  weeklyReset.start();
  dailyQuestReset.start();
  
  fastify.log.info('⏰ Cron jobs started: weekly reset (Mon 00:00), daily quest reset (00:00)');
} catch (err) {
  fastify.log.error(err);
  process.exit(1);
}
