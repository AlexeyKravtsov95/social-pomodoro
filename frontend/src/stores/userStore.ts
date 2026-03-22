import { create } from 'zustand';

interface User {
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
    inviteCode?: string;
    members?: any[];
  } | null;
  createdAt: string;
}

interface UserStore {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  
  setUser: (user: User) => void;
  updateUser: (data: Partial<User>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  isLoading: false,
  error: null,
  
  setUser: (user) => set({ user, error: null }),
  updateUser: (data) => set((state) => ({
    user: state.user ? { ...state.user, ...data } : null,
  })),
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
  clearUser: () => set({ user: null, error: null }),
}));
