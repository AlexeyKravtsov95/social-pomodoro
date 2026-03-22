import { FastifyInstance } from 'fastify';
import { healthRoutes } from './health.js';
import { authRoutes } from './auth.js';
import { userRoutes } from './user.js';
import { teamRoutes } from './team.js';
import { sessionRoutes } from './session.js';
import { leaderboardRoutes } from './leaderboard.js';
import { questRoutes } from './quest.js';

export async function registerRoutes(fastify: FastifyInstance) {
  // Health check
  await fastify.register(healthRoutes, { prefix: '/health' });
  
  // Auth (Telegram validation)
  await fastify.register(authRoutes, { prefix: '/api/auth' });
  
  // User endpoints
  await fastify.register(userRoutes, { prefix: '/api/user' });
  
  // Team endpoints
  await fastify.register(teamRoutes, { prefix: '/api/team' });
  
  // Focus session endpoints
  await fastify.register(sessionRoutes, { prefix: '/api/session' });
  
  // Leaderboard endpoints
  await fastify.register(leaderboardRoutes, { prefix: '/api/leaderboard' });
  
  // Quest endpoints
  await fastify.register(questRoutes, { prefix: '/api/quest' });
}
