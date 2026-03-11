import Fastify from 'fastify';
import cors from '@fastify/cors';
import { env } from './config/env.js';
import { prisma } from './db/prisma.js';
import { healthRoutes } from './routes/health.js';
import { authRoutes } from './routes/auth.js';
import { sessionsRoutes } from './routes/sessions.js';

const fastify = Fastify({
  logger: true,
});

// Register plugins
await fastify.register(cors, {
  origin: true, // Allow all origins for MVP (restrict in production)
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
});

// Register routes
await fastify.register(healthRoutes, { prefix: '/health' });
await fastify.register(authRoutes, { prefix: '/auth' });
await fastify.register(sessionsRoutes, { prefix: '/sessions' });

// Add prisma to request object
fastify.decorate('prisma', prisma);

// Graceful shutdown
const gracefulShutdown = async () => {
  fastify.log.info('Shutting down...');
  await fastify.close();
  await prisma.$disconnect();
  process.exit(0);
};

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
try {
  await fastify.listen({
    port: parseInt(env.PORT, 10),
    host: '0.0.0.0',
  });
  
  fastify.log.info(`🚀 Server running on http://localhost:${env.PORT}`);
  fastify.log.info(`📊 Environment: ${env.NODE_ENV}`);
} catch (error) {
  fastify.log.error(error);
  process.exit(1);
}
