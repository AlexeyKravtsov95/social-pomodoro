import { prisma } from '../db/prisma.js';
/**
 * Minimum session duration in minutes (anti-abuse)
 */
const MIN_SESSION_MINUTES = 5;
/**
 * Maximum session duration in minutes (anti-abuse)
 */
const MAX_SESSION_MINUTES = 180;
/**
 * XP per minute of focus
 */
const XP_PER_MINUTE = 10;
/**
 * Starts a new focus session
 */
export async function startFocusSession(userId, plannedMinutes) {
    // Validate planned duration
    if (plannedMinutes < MIN_SESSION_MINUTES) {
        throw new Error(`Session must be at least ${MIN_SESSION_MINUTES} minutes`);
    }
    if (plannedMinutes > MAX_SESSION_MINUTES) {
        throw new Error(`Session cannot exceed ${MAX_SESSION_MINUTES} minutes`);
    }
    // Check for active sessions
    const activeSession = await prisma.focusSession.findFirst({
        where: {
            userId,
            status: 'completed',
            completedAt: {
                gte: new Date(Date.now() - 5 * 60 * 1000), // Last 5 minutes
            },
        },
    });
    if (activeSession) {
        throw new Error('You have a recent session. Please wait before starting a new one.');
    }
    // Create session
    const session = await prisma.focusSession.create({
        data: {
            userId,
            plannedMinutes,
            actualMinutes: 0,
            status: 'completed',
            startedAt: new Date(),
            completedAt: new Date(Date.now() + plannedMinutes * 60 * 1000),
            xpEarned: 0,
            isValid: true,
        },
    });
    return {
        session: {
            id: session.id,
            startedAt: session.startedAt,
            plannedMinutes: session.plannedMinutes,
        },
        message: 'Session started. Good luck!',
    };
}
/**
 * Finishes a focus session with server-side validation
 */
export async function finishFocusSession(userId, sessionId) {
    const session = await prisma.focusSession.findUnique({
        where: { id: sessionId, userId },
    });
    if (!session) {
        throw new Error('Session not found');
    }
    if (session.userId !== userId) {
        throw new Error('This session does not belong to you');
    }
    const now = new Date();
    const actualMinutes = Math.floor((now.getTime() - session.startedAt.getTime()) / (1000 * 60));
    // Anti-abuse validation
    let isValid = true;
    let message = 'Session completed successfully!';
    // Check if session is too short
    if (actualMinutes < MIN_SESSION_MINUTES) {
        isValid = false;
        message = `Session too short (${actualMinutes} min). Minimum is ${MIN_SESSION_MINUTES} minutes. No XP awarded.`;
    }
    // Check if session is suspiciously long compared to planned
    if (actualMinutes > session.plannedMinutes * 2) {
        isValid = false;
        message = 'Session duration exceeds planned time significantly. Review required.';
    }
    // Check if trying to complete too early
    if (actualMinutes < session.plannedMinutes * 0.8) {
        isValid = false;
        message = 'Session completed too early. At least 80% of planned time is required.';
    }
    // Calculate XP
    const xpEarned = isValid ? actualMinutes * XP_PER_MINUTE : 0;
    // Update session
    const updatedSession = await prisma.focusSession.update({
        where: { id: sessionId },
        data: {
            actualMinutes,
            status: isValid ? 'completed' : 'failed',
            completedAt: now,
            xpEarned,
            isValid,
        },
    });
    // Update user progress if valid
    if (isValid) {
        await updateUserProgress(userId, actualMinutes, xpEarned);
    }
    return {
        session: {
            id: updatedSession.id,
            actualMinutes: updatedSession.actualMinutes,
            xpEarned: updatedSession.xpEarned,
            isValid: updatedSession.isValid,
        },
        xpEarned,
        message,
    };
}
/**
 * Updates user progress after a valid session
 */
async function updateUserProgress(userId, minutes, xp) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    // Update or create daily progress
    await prisma.userProgress.upsert({
        where: {
            userId_date: {
                userId,
                date: today,
            },
        },
        create: {
            userId,
            date: today,
            minutesFocused: minutes,
            sessionsCompleted: 1,
            xpEarned: xp,
        },
        update: {
            minutesFocused: { increment: minutes },
            sessionsCompleted: { increment: 1 },
            xpEarned: { increment: xp },
        },
    });
    // Update user XP and level
    const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { xp: true, level: true, streak: true, lastSessionAt: true },
    });
    if (!user)
        return;
    // Calculate new XP and level
    const newXp = user.xp + xp;
    const newLevel = Math.floor(newXp / 1000) + 1;
    // Calculate streak
    let newStreak = user.streak;
    if (user.lastSessionAt) {
        const lastSession = new Date(user.lastSessionAt);
        const daysDiff = Math.floor((today.getTime() - lastSession.getTime()) / (1000 * 60 * 60 * 24));
        if (daysDiff === 1) {
            newStreak += 1;
        }
        else if (daysDiff > 1) {
            newStreak = 1; // Reset streak
        }
        // If daysDiff === 0, streak stays the same (multiple sessions per day)
    }
    else {
        newStreak = 1;
    }
    // Update user
    await prisma.user.update({
        where: { id: userId },
        data: {
            xp: newXp,
            level: newLevel,
            streak: newStreak,
            lastSessionAt: today,
        },
    });
    // Update team progress if user is in a team
    await updateTeamProgress(userId, minutes);
}
/**
 * Updates team weekly progress
 */
async function updateTeamProgress(userId, minutes) {
    // Get user's team membership
    const membership = await prisma.teamMember.findFirst({
        where: { userId },
        include: { team: true },
    });
    if (!membership)
        return; // User not in a team
    const { team } = membership;
    const weekStart = getWeekStart(new Date());
    // Update or create team progress
    await prisma.teamProgress.upsert({
        where: {
            teamId_userId_weekStart: {
                teamId: team.id,
                userId,
                weekStart,
            },
        },
        create: {
            teamId: team.id,
            userId,
            weekStart,
            minutesContributed: minutes,
        },
        update: {
            minutesContributed: { increment: minutes },
        },
    });
    // Update team's total weekly progress
    await prisma.team.update({
        where: { id: team.id },
        data: {
            weeklyProgress: { increment: minutes },
        },
    });
}
/**
 * Gets the start of the week (Monday) for a given date
 */
function getWeekStart(date) {
    const result = new Date(date);
    const day = result.getDay();
    const diff = result.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    result.setDate(diff);
    result.setHours(0, 0, 0, 0);
    return result;
}
/**
 * Gets user's current active session if any
 */
export async function getActiveSession(userId) {
    const session = await prisma.focusSession.findFirst({
        where: {
            userId,
            status: 'completed',
            completedAt: {
                gte: new Date(Date.now() - 180 * 60 * 1000), // Last 3 hours
            },
        },
        orderBy: { startedAt: 'desc' },
    });
    return session;
}
//# sourceMappingURL=sessions.js.map