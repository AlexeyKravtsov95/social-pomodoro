const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Mock Telegram initData for development in browser
// Замените user.id на ваш Telegram ID для тестирования
const MOCK_INIT_DATA = 'query_id=test&user=%7B%22id%22%3A123456789%2C%22first_name%22%3A%22Test%22%2C%22username%22%3A%22testuser%22%7D&auth_date=1700000000&hash=test';

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  
  // Add Telegram auth if available
  let initData = window.Telegram?.WebApp?.initData;
  
  // Use mock initData in development if Telegram is not available
  if (!initData && window.location.hostname === 'localhost') {
    initData = MOCK_INIT_DATA;
  }
  
  if (initData) {
    headers.set('Authorization', `Telegram ${initData}`);
  }
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || `HTTP ${response.status}`);
  }
  
  return data;
}

export const api = {
  // Auth
  auth: {
    validate: (initData: string) =>
      request<{ user: any; queryId?: string }>('/auth/validate', {
        method: 'POST',
        body: JSON.stringify({ initData }),
      }),
  },
  
  // User
  user: {
    getMe: () => request<any>('/user/me'),
    updateMe: (data: Partial<{ username: string; firstName: string; lastName: string }>) =>
      request<any>('/user/me', {
        method: 'PATCH',
        body: JSON.stringify(data),
      }),
  },
  
  // Team
  team: {
    create: (name: string, description?: string) =>
      request<any>('/team', {
        method: 'POST',
        body: JSON.stringify({ name, description }),
      }),
    join: (inviteCode: string) =>
      request<any>('/team/join', {
        method: 'POST',
        body: JSON.stringify({ inviteCode }),
      }),
    getMy: () => request<{
      id: number;
      name: string;
      description: string | null;
      inviteCode: string;
      weeklyGoal: number;
      weeklyProgress: number;
      weekStart?: string;
      members: any[];
    } | null>('/team/my'),
    leave: () => request<{ success: boolean }>('/team/leave', {
      method: 'POST',
    }),
  },
  
  // Session
  session: {
    start: (duration: number) =>
      request<any>('/session/start', {
        method: 'POST',
        body: JSON.stringify({ duration: duration.toString() }),
      }),
    finish: (sessionId: number) =>
      request<any>('/session/finish', {
        method: 'POST',
        body: JSON.stringify({ sessionId }),
      }),
    getActive: () => request<{ active: boolean; session?: any }>('/session/active'),
    getHistory: () => request<{ sessions: any[] }>('/session/history'),
  },
  
  // Leaderboard
  leaderboard: {
    getGlobal: () => request<{ leaderboard: any[]; currentUser: any }>('/leaderboard/global'),
    getTeam: () => request<{
      teamId: number;
      teamName: string;
      weeklyGoal: number;
      weeklyProgress: number;
      members: any[];
    }>('/leaderboard/team'),
  },
  
  // Quests
  quest: {
    getDaily: () => request<{ quests: any[] }>('/quest/daily'),
    updateProgress: (questType: string, progress: number) =>
      request('/quest/progress', {
        method: 'POST',
        body: JSON.stringify({ questType, progress }),
      }),
  },
};
