/**
 * Seed script to create initial daily quests
 * Run with: npx tsx scripts/seed-quests.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const defaultQuests = [
  {
    name: 'Первый фокус',
    description: 'Завершите 1 фокус-сессию',
    type: 'focus_session',
    target: 1,
    xpReward: 50,
  },
  {
    name: 'Три фокуса',
    description: 'Завершите 3 фокус-сессии',
    type: 'focus_session',
    target: 3,
    xpReward: 150,
  },
  {
    name: 'Пять фокусов',
    description: 'Завершите 5 фокус-сессий',
    type: 'focus_session',
    target: 5,
    xpReward: 300,
  },
  {
    name: 'Командный игрок',
    description: 'Завершите сессию, будучи в команде',
    type: 'team_focus',
    target: 1,
    xpReward: 100,
  },
];

async function main() {
  console.log('🌱 Seeding daily quests...');
  
  // Check if quests already exist
  const existingCount = await prisma.dailyQuest.count();
  
  if (existingCount > 0) {
    console.log('✅ Quests already exist. Skipping seed.');
    return;
  }
  
  // Create quests
  for (const quest of defaultQuests) {
    await prisma.dailyQuest.create({
      data: quest,
    });
    console.log(`  ✓ Created: ${quest.name}`);
  }
  
  console.log('✅ Quest seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
