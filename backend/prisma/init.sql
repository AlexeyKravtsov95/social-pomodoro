-- Migration script for Railway
-- This ensures the database schema is created without using db push

-- Users table
CREATE TABLE IF NOT EXISTS "User" (
    "id" BIGSERIAL PRIMARY KEY,
    "telegramId" BIGINT UNIQUE NOT NULL,
    "username" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "photoUrl" TEXT,
    "xp" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "streak" INTEGER NOT NULL DEFAULT 0,
    "lastFocusDate" DATE,
    "teamId" BIGINT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- Team table
CREATE TABLE IF NOT EXISTS "Team" (
    "id" BIGSERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "inviteCode" TEXT UNIQUE NOT NULL,
    "weeklyGoal" INTEGER NOT NULL DEFAULT 1000,
    "weeklyProgress" INTEGER NOT NULL DEFAULT 0,
    "weekStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL
);

-- TeamMember table
CREATE TABLE IF NOT EXISTS "TeamMember" (
    "id" BIGSERIAL PRIMARY KEY,
    "userId" BIGINT NOT NULL,
    "teamId" BIGINT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'member',
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE ("userId", "teamId")
);

-- FocusSession table
CREATE TABLE IF NOT EXISTS "FocusSession" (
    "id" BIGSERIAL PRIMARY KEY,
    "userId" BIGINT NOT NULL,
    "duration" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "xpEarned" INTEGER NOT NULL DEFAULT 0,
    "isValid" BOOLEAN NOT NULL DEFAULT true,
    "flagged" BOOLEAN NOT NULL DEFAULT false,
    "flagReason" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- WeeklyReset table
CREATE TABLE IF NOT EXISTS "WeeklyReset" (
    "id" BIGSERIAL PRIMARY KEY,
    "weekStart" TIMESTAMP(3) UNIQUE NOT NULL,
    "weekEnd" TIMESTAMP(3) NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- DailyQuest table
CREATE TABLE IF NOT EXISTS "DailyQuest" (
    "id" BIGSERIAL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "xpReward" INTEGER NOT NULL DEFAULT 50,
    "type" TEXT NOT NULL,
    "target" INTEGER NOT NULL DEFAULT 1,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- UserQuestProgress table
CREATE TABLE IF NOT EXISTS "UserQuestProgress" (
    "id" BIGSERIAL PRIMARY KEY,
    "userId" BIGINT NOT NULL,
    "questId" BIGINT NOT NULL,
    "progress" INTEGER NOT NULL DEFAULT 0,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "date" DATE NOT NULL,
    UNIQUE ("userId", "questId", "date")
);

-- Indexes
CREATE INDEX IF NOT EXISTS "User_telegramId_idx" ON "User"("telegramId");
CREATE INDEX IF NOT EXISTS "User_teamId_idx" ON "User"("teamId");
CREATE INDEX IF NOT EXISTS "User_xp_idx" ON "User"("xp");
CREATE INDEX IF NOT EXISTS "Team_inviteCode_idx" ON "Team"("inviteCode");
CREATE INDEX IF NOT EXISTS "TeamMember_teamId_idx" ON "TeamMember"("teamId");
CREATE INDEX IF NOT EXISTS "TeamMember_userId_idx" ON "TeamMember"("userId");
CREATE INDEX IF NOT EXISTS "FocusSession_userId_idx" ON "FocusSession"("userId");
CREATE INDEX IF NOT EXISTS "FocusSession_userId_completedAt_idx" ON "FocusSession"("userId", "completedAt");
CREATE INDEX IF NOT EXISTS "FocusSession_startedAt_idx" ON "FocusSession"("startedAt");
CREATE INDEX IF NOT EXISTS "WeeklyReset_weekStart_idx" ON "WeeklyReset"("weekStart");
CREATE INDEX IF NOT EXISTS "DailyQuest_type_idx" ON "DailyQuest"("type");
CREATE INDEX IF NOT EXISTS "UserQuestProgress_userId_date_idx" ON "UserQuestProgress"("userId", "date");

-- Foreign Keys
ALTER TABLE "User" ADD CONSTRAINT "User_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE SET NULL;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE CASCADE;
ALTER TABLE "FocusSession" ADD CONSTRAINT "FocusSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "UserQuestProgress" ADD CONSTRAINT "UserQuestProgress_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE;
ALTER TABLE "UserQuestProgress" ADD CONSTRAINT "UserQuestProgress_questId_fkey" FOREIGN KEY ("questId") REFERENCES "DailyQuest"("id") ON DELETE CASCADE;
