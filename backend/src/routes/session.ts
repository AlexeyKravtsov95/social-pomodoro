import { FastifyInstance } from 'fastify';
import { z } from 'zod';
import { authMiddleware } from './user.js';

const startSessionSchema = z.object({
  duration: z.enum(['15', '25', '45', '60']).transform(Number),
});

const finishSessionSchema = z.object({
  sessionId: z.number(),
});

// XP calculation based on duration
function calculateXP(duration: number): number {
  const xpPerMinute = 10;
  return duration * xpPerMinute;
}

// Calculate level based on XP (simple formula)
function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

export async function sessionRoutes(fastify: FastifyInstance) {
  // Start a focus session
  fastify.post('/start', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser;
        const body = startSessionSchema.parse(request.body);
        
        // Find user
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        // Check for active session
        const activeSession = await fastify.prisma.focusSession.findFirst({
          where: {
            userId: user.id,
            completedAt: null,
          },
        });
        
        if (activeSession) {
          return reply.status(400).send({ 
            error: 'Session already in progress',
            sessionId: Number(activeSession.id),
          });
        }
        
        // Create session
        const session = await fastify.prisma.focusSession.create({
          data: {
            userId: user.id,
            duration: body.duration,
            startedAt: new Date(),
            xpEarned: calculateXP(body.duration),
          },
        });
        
        return {
          id: Number(session.id),
          duration: session.duration,
          startedAt: session.startedAt.toISOString(),
          xpEarned: session.xpEarned,
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Invalid request body',
            details: error.errors,
          });
        }
        
        fastify.log.error('Start session error:', error);
        return reply.status(500).send({
          error: 'Failed to start session',
        });
      }
    },
  });
  
  // Finish a focus session
  fastify.post('/finish', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser;
        const body = finishSessionSchema.parse(request.body);
        
        // Find user
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        // Find session
        const session = await fastify.prisma.focusSession.findFirst({
          where: {
            id: BigInt(body.sessionId),
            userId: user.id,
            completedAt: null,
          },
        });
        
        if (!session) {
          return reply.status(404).send({ error: 'Session not found' });
        }
        
        // Validate session duration (anti-abuse)
        const now = new Date();
        const elapsedMinutes = (now.getTime() - session.startedAt.getTime()) / (1000 * 60);
        const minRequiredMinutes = session.duration * 0.8; // 80% of duration
        
        let isValid = true;
        let flagReason: string | null = null;
        
        if (elapsedMinutes < minRequiredMinutes) {
          isValid = false;
          flagReason = `Session finished too early. Expected: ${session.duration}min, Actual: ${elapsedMinutes.toFixed(1)}min`;
        }
        
        // Update session
        const updatedSession = await fastify.prisma.focusSession.update({
          where: { id: session.id },
          data: {
            completedAt: now,
            isValid,
            flagReason,
          },
        });
        
        // If valid, award XP and update streak
        if (isValid) {
          const newXp = user.xp + session.xpEarned;
          const newLevel = calculateLevel(newXp);
          
          // Check streak (focus on consecutive days)
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const lastFocusDate = user.lastFocusDate ? new Date(user.lastFocusDate) : null;
          
          let newStreak = user.streak;
          if (lastFocusDate) {
            const daysDiff = (today.getTime() - lastFocusDate.getTime()) / (1000 * 60 * 60 * 24);
            if (daysDiff > 1) {
              newStreak = 1; // Reset streak
            } else if (daysDiff === 1) {
              newStreak += 1; // Continue streak
            }
            // If daysDiff === 0, already focused today, keep streak
          } else {
            newStreak = 1; // First session
          }
          
          // Update user
          await fastify.prisma.user.update({
            where: { id: user.id },
            data: {
              xp: newXp,
              level: newLevel,
              streak: newStreak,
              lastFocusDate: today,
            },
          });
          
          // Update team weekly progress if user is in a team
          if (user.teamId) {
            await fastify.prisma.team.update({
              where: { id: user.teamId },
              data: {
                weeklyProgress: {
                  increment: session.xpEarned,
                },
              },
            });
          }
          
          // Update quest progress (focus_session quest)
          try {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            const focusQuests = await fastify.prisma.dailyQuest.findMany({
              where: {
                type: 'focus_session',
                active: true,
              },
            });
            
            for (const quest of focusQuests) {
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
                    progress: 1,
                    completed: 1 >= quest.target,
                  },
                });
              } else if (!progress.completed) {
                const newProgress = progress.progress + 1;
                await fastify.prisma.userQuestProgress.update({
                  where: { id: progress.id },
                  data: {
                    progress: newProgress,
                    completed: newProgress >= quest.target,
                  },
                });
              }
            }
          } catch (questError) {
            fastify.log.error('Failed to update quest progress:', questError);
            // Don't fail the session if quest update fails
          }
          
          return {
            id: Number(updatedSession.id),
            duration: updatedSession.duration,
            startedAt: updatedSession.startedAt.toISOString(),
            completedAt: updatedSession.completedAt?.toISOString(),
            xpEarned: updatedSession.xpEarned,
            isValid: updatedSession.isValid,
            user: {
              xp: newXp,
              level: newLevel,
              streak: newStreak,
            },
          };
        }
        
        return {
          id: Number(updatedSession.id),
          duration: updatedSession.duration,
          startedAt: updatedSession.startedAt.toISOString(),
          completedAt: updatedSession.completedAt?.toISOString(),
          xpEarned: 0, // No XP for invalid session
          isValid: false,
          flagReason: updatedSession.flagReason,
          message: 'Session flagged for finishing too early. No XP awarded.',
        };
      } catch (error) {
        if (error instanceof z.ZodError) {
          return reply.status(400).send({
            error: 'Invalid request body',
            details: error.errors,
          });
        }
        
        fastify.log.error('Finish session error:', error);
        return reply.status(500).send({
          error: 'Failed to finish session',
        });
      }
    },
  });
  
  // Get user's session history
  fastify.get('/history', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser;
        
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        const sessions = await fastify.prisma.focusSession.findMany({
          where: { userId: user.id },
          orderBy: { startedAt: 'desc' },
          take: 50,
        });
        
        return {
          sessions: sessions.map(s => ({
            id: Number(s.id),
            duration: s.duration,
            startedAt: s.startedAt.toISOString(),
            completedAt: s.completedAt?.toISOString(),
            xpEarned: s.xpEarned,
            isValid: s.isValid,
          })),
        };
      } catch (error) {
        fastify.log.error('Get session history error:', error);
        return reply.status(500).send({
          error: 'Failed to get session history',
        });
      }
    },
  });
  
  // Get active session
  fastify.get('/active', {
    preHandler: [authMiddleware],
    async handler(request, reply) {
      try {
        const telegramUser = request.telegramUser;
        
        const user = await fastify.prisma.user.findUnique({
          where: { telegramId: BigInt(telegramUser.id) },
        });
        
        if (!user) {
          return reply.status(404).send({ error: 'User not found' });
        }
        
        const activeSession = await fastify.prisma.focusSession.findFirst({
          where: {
            userId: user.id,
            completedAt: null,
          },
        });
        
        if (!activeSession) {
          return { active: false };
        }
        
        const now = new Date();
        const elapsedMs = now.getTime() - activeSession.startedAt.getTime();
        const elapsedSeconds = Math.floor(elapsedMs / 1000);
        
        return {
          active: true,
          session: {
            id: Number(activeSession.id),
            duration: activeSession.duration,
            startedAt: activeSession.startedAt.toISOString(),
            xpEarned: activeSession.xpEarned,
            elapsedSeconds,
          },
        };
      } catch (error) {
        fastify.log.error('Get active session error:', error);
        return reply.status(500).send({
          error: 'Failed to get active session',
        });
      }
    },
  });
}
