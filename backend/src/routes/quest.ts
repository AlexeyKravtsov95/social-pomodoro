import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from './user.js';

export async function questRoutes(fastify: FastifyInstance) {
  // Get active quests and user progress
  fastify.get('/daily', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser!;
        
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get all active quests
        const quests = await fastify.prisma.dailyQuest.findMany({
          where: { active: true },
          include: {
            userProgress: {
              where: {
                userId: user.id,
                date: today,
              },
            },
          },
        });
        
        return {
          quests: quests.map(q => ({
            id: Number(q.id),
            name: q.name,
            description: q.description,
            type: q.type,
            target: q.target,
            xpReward: q.xpReward,
            progress: q.userProgress[0]?.progress || 0,
            completed: q.userProgress[0]?.completed || false,
          })),
        };
      } catch (error) {
        fastify.log.error({ err: error instanceof Error ? error : new Error('Unknown') }, 'Get daily quests error:')
        return reply.status(500).send({
          error: 'Failed to get daily quests',
        });
      }
    },
  });
  
  // Update quest progress (called after completing actions)
  fastify.post('/progress', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser!;
        
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        const body = z.object({
          questType: z.enum(['focus_session', 'streak', 'team_focus']),
          progress: z.number().int().positive(),
        }).parse(request.body);
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Get quests of this type
        const quests = await fastify.prisma.dailyQuest.findMany({
          where: {
            type: body.questType,
            active: true,
          },
        });
        
        const results = [];
        
        for (const quest of quests) {
          // Get or create progress
          let progress = await fastify.prisma.userQuestProgress.findUnique({
            where: {
              userId_questId_date: {
                userId: user.id,
                questId: quest.id,
                date: today,
              },
            },
          });
          
          if (!progress) {
            progress = await fastify.prisma.userQuestProgress.create({
              data: {
                userId: user.id,
                questId: quest.id,
                date: today,
                progress: 0,
                completed: false,
              },
            });
          }
          
          // Skip if already completed
          if (progress.completed) {
            results.push({
              questId: Number(quest.id),
              completed: true,
              claimed: false,
            });
            continue;
          }
          
          // Update progress
          const newProgress = Math.min(progress.progress + body.progress, quest.target);
          const isCompleted = newProgress >= quest.target;
          
          const updatedProgress = await fastify.prisma.userQuestProgress.update({
            where: { id: progress.id },
            data: {
              progress: newProgress,
              completed: isCompleted,
            },
          });
          
          // Award XP if completed
          let xpEarned = 0;
          if (isCompleted && !progress.completed) {
            await fastify.prisma.user.update({
              where: { id: user.id },
              data: { xp: { increment: quest.xpReward } },
            });
            xpEarned = quest.xpReward;
          }
          
          results.push({
            questId: Number(quest.id),
            completed: isCompleted,
            progress: updatedProgress.progress,
            target: quest.target,
            xpEarned,
          });
        }
        
        return { results };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Invalid request body',
            details: error.errors,
          });
        }
        
        fastify.log.error({ err: error instanceof Error ? error : new Error('Unknown') }, 'Update quest progress error:')
        return reply.status(500).send({
          error: 'Failed to update quest progress',
        });
      }
    },
  });
}
