const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };
  
  const response = await fetch(url, {
    ...options,
    headers,
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Request failed');
  }
  
  return data;
}

export const api = {
  auth: {
    login: (initData: string) => 
      request<{ success: boolean; user: any; token: string }>('/auth/telegram', {
        method: 'POST',
        body: JSON.stringify({ initData }),
      }),
    
    me: (token: string) =>
      request<{ success: boolean; user: any }>('/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
  },
  
  sessions: {
    getActive: (token: string) =>
      request<{ success: boolean; active: boolean; session: any | null }>('/sessions/active', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }),
    
    start: (token: string, plannedMinutes: number) =>
      request<{ success: boolean; session: any; message: string }>('/sessions/start', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ plannedMinutes }),
      }),
    
    finish: (token: string, sessionId: number) =>
      request<{ success: boolean; session: any; xpEarned: number; message: string }>('/sessions/finish', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ sessionId }),
      }),
  },
};
