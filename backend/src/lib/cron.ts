import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';

/**
 * Weekly reset job
 * Resets team weekly progress every Monday at 00:00
 */
export function setupWeeklyReset(prisma: PrismaClient) {
  // Run every Monday at 00:00
  const job = cron.schedule('0 0 * * 1', async () => {
    console.log('[Cron] Running weekly reset...');
    
    try {
      const now = new Date();
      const weekStart = new Date(now);
      weekStart.setHours(0, 0, 0, 0);
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 7);
      
      // Check if we already have a reset for this week
      const existingReset = await prisma.weeklyReset.findUnique({
        where: { weekStart },
      });
      
      if (existingReset) {
        console.log('[Cron] Weekly reset already processed for this week');
        return;
      }
      
      // Reset all teams' weekly progress
      const result = await prisma.team.updateMany({
        data: {
          weeklyProgress: 0,
          weekStart,
        },
      });
      
      // Create reset record
      await prisma.weeklyReset.create({
        data: {
          weekStart,
          weekEnd,
          completed: true,
          processedAt: new Date(),
        },
      });
      
      console.log(`[Cron] Weekly reset complete. Reset ${result.count} teams.`);
    } catch (error) {
      console.error('[Cron] Weekly reset failed:', error instanceof Error ? error.message : error);
    }
  });
  
  return job;
}

/**
 * Daily quest reset job
 * Resets user quest progress every day at 00:00
 */
export function setupDailyQuestReset(prisma: PrismaClient) {
  // Run every day at 00:00
  const job = cron.schedule('0 0 * * *', async () => {
    console.log('[Cron] Running daily quest reset...');
    
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      // Get all active quests
      const activeQuests = await prisma.dailyQuest.findMany({
        where: { active: true },
      });
      
      if (activeQuests.length === 0) {
        console.log('[Cron] No active quests found');
        return;
      }
      
      // Get all users
      const users = await prisma.user.findMany({
        select: { id: true },
      });
      
      console.log(`[Cron] Resetting progress for ${users.length} users and ${activeQuests.length} quests`);
      
      // Note: We don't delete old progress, we just let it be
      // New progress will be created for today when users complete actions
    } catch (error) {
      console.error('[Cron] Daily quest reset failed:', error);
    }
  });
  
  return job;
}
