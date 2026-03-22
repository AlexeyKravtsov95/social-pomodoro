import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from './user.js';

const createTeamSchema = z.object({
  name: z.string().min(1).max(50),
  description: z.string().max(200).optional(),
});

const joinTeamSchema = z.object({
  inviteCode: z.string(),
});

export async function teamRoutes(fastify: FastifyInstance) {
  // Create a new team
  fastify.post('/', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser!;
        const body = createTeamSchema.parse(request.body);
        
        // Find user
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        if (user.teamId) {
          return reply.status(400).send({ error: 'User already in a team' });
        }
        
        // Create team with user as owner
        const team = await fastify.prisma.team.create({
          data: {
            name: body.name,
            description: body.description,
            members: {
              create: {
                userId: user.id,
                role: 'owner',
              },
            },
          },
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
                  },
                },
              },
            },
          },
        });
        
        // Update user's teamId
        await fastify.prisma.user.update({
          where: { id: user.id },
          data: { teamId: team.id },
        });
        
        return {
          id: Number(team.id),
          name: team.name,
          description: team.description,
          inviteCode: team.inviteCode,
          weeklyGoal: team.weeklyGoal,
          weeklyProgress: team.weeklyProgress,
          members: team.members.map(m => ({
            id: Number(m.user.id),
            username: m.user.username,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            photoUrl: m.user.photoUrl,
            xp: m.user.xp,
            role: m.role,
          })),
          createdAt: team.createdAt.toISOString(),
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Invalid request body',
            details: error.errors,
          });
        }
        
        fastify.log.error({ err: error instanceof Error ? error : new Error('Unknown') }, 'Create team error:')
        return reply.status(500).send({
          error: 'Failed to create team',
        });
      }
    },
  });
  
  // Join team by invite code
  fastify.post('/join', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser!;
        const body = joinTeamSchema.parse(request.body);
        
        // Find user
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        if (user.teamId) {
          return reply.status(400).send({ error: 'User already in a team' });
        }
        
        // Find team by invite code
        const team = await fastify.prisma.team.findUnique({
          where: { inviteCode: body.inviteCode },
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
                  },
                },
              },
            },
          },
        });
        
        if (!team) {
          return reply.status(404).send({ error: 'Team not found' });
        }
        
        // Add user to team
        await fastify.prisma.teamMember.create({
          data: {
            userId: user.id,
            teamId: team.id,
            role: 'member',
          },
        });
        
        // Update user's teamId
        await fastify.prisma.user.update({
          where: { id: user.id },
          data: { teamId: team.id },
        });
        
        return {
          id: Number(team.id),
          name: team.name,
          description: team.description,
          inviteCode: team.inviteCode,
          weeklyGoal: team.weeklyGoal,
          weeklyProgress: team.weeklyProgress,
          members: team.members.map(m => ({
            id: Number(m.user.id),
            username: m.user.username,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            photoUrl: m.user.photoUrl,
            xp: m.user.xp,
            role: m.role,
          })),
          joinedAt: new Date().toISOString(),
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Invalid request body',
            details: error.errors,
          });
        }
        
        fastify.log.error({ err: error instanceof Error ? error : new Error('Unknown') }, 'Join team error:')
        return reply.status(500).send({
          error: 'Failed to join team',
        });
      }
    },
  });
  
  // Get team info
  fastify.get('/my', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser!;
        
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
          include: {
            team: {
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
                        streak: true,
                      },
                    },
                  },
                  orderBy: { role: 'desc' },
                },
              },
            },
          },
        });
        
        if (!user || !user.team) {
          return reply.status(404).send({ error: 'Not in a team' });
        }
        
        return {
          id: Number(user.team.id),
          name: user.team.name,
          description: user.team.description,
          inviteCode: user.team.inviteCode,
          weeklyGoal: user.team.weeklyGoal,
          weeklyProgress: user.team.weeklyProgress,
          weekStart: user.team.weekStart.toISOString(),
          members: user.team.members.map(m => ({
            id: Number(m.user.id),
            username: m.user.username,
            firstName: m.user.firstName,
            lastName: m.user.lastName,
            photoUrl: m.user.photoUrl,
            xp: m.user.xp,
            streak: m.user.streak,
            role: m.role,
            joinedAt: m.joinedAt.toISOString(),
          })),
        };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error('Unknown') }, 'Get team error:')
        return reply.status(500).send({
          error: 'Failed to get team',
        });
      }
    },
  });
  
  // Leave team
  fastify.post('/leave', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser!;
        
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user || !user.teamId) {
          return reply.status(400).send({ error: 'Not in a team' });
        }
        
        // Check if user is owner
        const membership = await fastify.prisma.teamMember.findUnique({
          where: {
            userId_teamId: {
              userId: user.id,
              teamId: user.teamId,
            },
          },
        });
        
        if (membership?.role === 'owner') {
          return reply.status(400).send({ 
            error: 'Owner cannot leave. Transfer ownership or delete team.',
          });
        }
        
        // Remove from team
        await fastify.prisma.teamMember.delete({
          where: {
            userId_teamId: {
              userId: user.id,
              teamId: user.teamId,
            },
          },
        });
        
        // Update user's teamId
        await fastify.prisma.user.update({
          where: { id: user.id },
          data: { teamId: null },
        });
        
        return { success: true };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error('Unknown') }, 'Leave team error:')
        return reply.status(500).send({
          error: 'Failed to leave team',
        });
      }
    },
  });
}
