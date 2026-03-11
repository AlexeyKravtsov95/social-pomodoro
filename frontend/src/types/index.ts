export interface User {
  id: number;
  telegramId: string;
  username?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  photoUrl?: string | null;
  xp: number;
  level: number;
  streak: number;
  teams?: Array<{
    teamId: number;
    teamName: string;
    role: string;
  }>;
}

export interface Session {
  id: number;
  plannedMinutes: number;
  actualMinutes?: number;
  elapsedSeconds?: number;
  remainingSeconds?: number;
  startedAt: string;
}

export interface Team {
  id: number;
  name: string;
  description?: string | null;
  inviteCode: string;
  weeklyGoal: number;
  weeklyProgress: number;
  members?: TeamMember[];
}

export interface TeamMember {
  id: number;
  userId: number;
  role: string;
  user: User;
  minutesContributed?: number;
}

export interface ApiResponse<T> {
  success: boolean;
  error?: string;
  data?: T;
}
