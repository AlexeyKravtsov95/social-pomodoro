import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { validateInitData, extractInitDataFromHeader } from '../lib/telegram-auth.js';

// Middleware to validate Telegram auth on protected routes
export async function authMiddleware(
  request: any,
  reply: any,
) {
  const authHeader = request.headers.authorization;
  const initData = extractInitDataFromHeader(authHeader);
  
  // Skip validation in development mode or if DISABLE_AUTH is set
  if (request.server.env.NODE_ENV === 'development' || request.server.env.DISABLE_AUTH === 'true') {
    // Create mock user for development/testing (no auth required)
    request.telegramUser = {
      id: 123456789,
      first_name: 'Test',
      last_name: 'User',
      username: 'testuser',
      photo_url: null,
    };
    return;
  }
  
  if (!initData) {
    return reply.status(401).send({ error: 'Missing Telegram auth' });
  }
  
  const telegramData = validateInitData(initData, request.server.env.TELEGRAM_BOT_TOKEN);
  
  if (!telegramData) {
    return reply.status(401).send({ error: 'Invalid Telegram auth' });
  }
  
  // Attach validated user to request
  request.telegramUser = telegramData.user;
}

const userResponseSchema = z.object({
  id: z.number(),
  telegramId: z.number(),
  username: z.string().nullable(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  photoUrl: z.string().nullable(),
  xp: z.number(),
  level: z.number(),
  streak: z.number(),
  teamId: z.number().nullable(),
  createdAt: z.string(),
});

export async function userRoutes(fastify: FastifyInstance) {
  // Get or create user profile
  fastify.get('/me', { 
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser;
        
        // Find or create user
        let user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
          include: {
            team: {
              select: {
                id: true,
                name: true,
                weeklyGoal: true,
                weeklyProgress: true,
              },
            },
          },
        });
        
        if (!user) {
          // Create new user
          user = await fastify.prisma.user.create({
            data: {
              telegramId: BigInt(telegramUser.id),
              username: telegramUser.username,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              photoUrl: telegramUser.photo_url,
            },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  weeklyGoal: true,
                  weeklyProgress: true,
                },
              },
            },
          });
        } else {
          // Update user info if changed
          user = await fastify.prisma.user.update({
            where: { id: user.id },
            data: {
              username: telegramUser.username,
              firstName: telegramUser.first_name,
              lastName: telegramUser.last_name,
              photoUrl: telegramUser.photo_url,
            },
            include: {
              team: {
                select: {
                  id: true,
                  name: true,
                  weeklyGoal: true,
                  weeklyProgress: true,
                },
              },
            },
          });
        }
        
        return {
          id: Number(user.id),
          telegramId: Number(user.telegramId),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          teamId: user.teamId ? Number(user.teamId) : null,
          team: user.team ? {
            id: Number(user.team.id),
            name: user.team.name,
            weeklyGoal: user.team.weeklyGoal,
            weeklyProgress: user.team.weeklyProgress,
          } : null,
          createdAt: user.createdAt.toISOString(),
        };
      } catch (error) {
        fastify.log.error({ err: error }, 'Get user error:');
        return reply.status(500).send({
          error: 'Failed to get user profile',
        });
      }
    },
  });
  
  // Update user profile
  fastify.patch('/me', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser;
        
        const updateSchema = z.object({
          username: z.string().optional(),
          firstName: z.string().optional(),
          lastName: z.string().optional(),
        });
        
        const body = updateSchema.parse(request.body);
        
        const user = await fastify.prisma.user.update({
          where: { telegramId: BigInt(telegramUser.id) },
          data: body,
        });
        
        return {
          id: Number(user.id),
          telegramId: Number(user.telegramId),
          username: user.username,
          firstName: user.firstName,
          lastName: user.lastName,
          photoUrl: user.photoUrl,
          xp: user.xp,
          level: user.level,
          streak: user.streak,
          teamId: user.teamId ? Number(user.teamId) : null,
          createdAt: user.createdAt.toISOString(),
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Invalid request body',
            details: error.errors,
          });
        }
        
        fastify.log.error({ err: error }, 'Update user error:');
        return reply.status(500).send({
          error: 'Failed to update user profile',
        });
      }
    },
  });
}
