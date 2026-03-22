export interface User {
  id: number;
  telegramId: number;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  xp: number;
  level: number;
  streak: number;
  teamId: number | null;
  team: {
    id: number;
    name: string;
    weeklyGoal: number;
    weeklyProgress: number;
  } | null;
  createdAt: string;
}

export interface Team {
  id: number;
  name: string;
  description: string | null;
  inviteCode: string;
  weeklyGoal: number;
  weeklyProgress: number;
  weekStart: string;
  members: TeamMember[];
}

export interface TeamMember {
  id: number;
  username: string | null;
  firstName: string | null;
  lastName: string | null;
  photoUrl: string | null;
  xp: number;
  streak: number;
  role: string;
  joinedAt: string;
}

export interface Session {
  id: number;
  duration: number;
  startedAt: string;
  completedAt: string | null;
  xpEarned: number;
  isValid: boolean;
  flagReason?: string | null;
}

export interface ActiveSession {
  active: boolean;
  session?: {
    id: number;
    duration: number;
    startedAt: string;
    xpEarned: number;
    elapsedSeconds: number;
  };
}
