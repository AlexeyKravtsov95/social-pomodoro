import { FastifyInstance } from 'fastify';
import { authMiddleware } from './user.js';

export async function leaderboardRoutes(fastify: FastifyInstance) {
  // Global leaderboard (top 100 users by XP)
  fastify.get('/global', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser;
        
        // Get current user
        const currentUser = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!currentUser) {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        // Get top 100 users
        const topUsers = await fastify.prisma.user.findMany({
          select: {
            id: true,
            telegramId: true,
            username: true,
            firstName: true,
            lastName: true,
            photoUrl: true,
            xp: true,
            level: true,
            streak: true,
            team: {
              select: {
                name: true,
              },
            },
          },
          orderBy: {
            xp: 'desc',
          },
          take: 100,
        });
        
        // Find current user rank
        const userRank = await fastify.prisma.user.count({
          where: {
            xp: {
              gt: currentUser.xp,
            },
          },
        }) + 1;
        
        return {
          leaderboard: topUsers.map((u, index) => ({
            rank: index + 1,
            id: Number(u.id),
            telegramId: Number(u.telegramId),
            username: u.username,
            firstName: u.firstName,
            lastName: u.lastName,
            photoUrl: u.photoUrl,
            xp: u.xp,
            level: u.level,
            streak: u.streak,
            teamName: u.team?.name || null,
          })),
          currentUser: {
            rank: userRank,
            id: Number(currentUser.id),
            telegramId: Number(currentUser.telegramId),
            username: currentUser.username,
            firstName: currentUser.firstName,
            lastName: currentUser.lastName,
            photoUrl: currentUser.photoUrl,
            xp: currentUser.xp,
            level: currentUser.level,
            streak: currentUser.streak,
            teamName: currentUser.team?.name || null,
          },
        };
      } catch (error) {
        fastify.log.error('Get global leaderboard error:', error);
        return reply.status(500).send({
          error: 'Failed to get global leaderboard',
        });
      }
    },
  });
  
  // Team leaderboard (members sorted by XP)
  fastify.get('/team', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser;
        
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user || !user.teamId) {
          return reply.status(404).send({ error: 'Not in a team' });
        }
        
        const team = await fastify.prisma.team.findUnique({
          where: { id: user.teamId },
          include: {
            members: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    firstName: true,
                    lastName: true,
                    photoUrl: true,
                    xp: true,
                    level: true,
                    streak: true,
                  },
                },
              },
              orderBy: {
                user: {
                  xp: 'desc',
                },
              },
            },
          },
        });
        
        if (!team) {
          return reply.status(404).send({ error: 'Team not found' });
        }
        
        return {
          teamId: Number(team.id),
          teamName: team.name,
          weeklyGoal: team.weeklyGoal,
          weeklyProgress: team.weeklyProgress,
          members: team.members.map((m, index) => ({
            rank: index + 1,
            id: Number(m.user.id),
            username: m.user.username,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            photoUrl: m.user.photoUrl,
            xp: m.user.xp,
            level: m.user.level,
            streak: m.user.streak,
            role: m.role,
          })),
        };
      } catch (error) {
        fastify.log.error('Get team leaderboard error:', error);
        return reply.status(500).send({
          error: 'Failed to get team leaderboard',
        });
      }
    },
  });
}
