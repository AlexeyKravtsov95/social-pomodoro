import { create } from 'zustand';
import type { User } from '../types';

interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  telegramInitData: string | null;
  
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setTelegramInitData: (data: string | null) => void;
  logout: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  telegramInitData: null,
  
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setToken: (token) => set({ token }),
  setTelegramInitData: (data) => set({ telegramInitData: data }),
  logout: () => set({ user: null, token: null, isAuthenticated: false }),
}));
