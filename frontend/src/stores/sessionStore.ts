import { create } from 'zustand';

interface Session {
  id: number;
  duration: number;
  startedAt: string;
  xpEarned: number;
}

interface SessionStore {
  activeSession: Session | null;
  isRunning: boolean;
  elapsedSeconds: number;
  
  startSession: (session: Session) => void;
  finishSession: () => void;
  updateElapsed: (seconds: number) => void;
  clearSession: () => void;
}

export const useSessionStore = create<SessionStore>((set) => ({
  activeSession: null,
  isRunning: false,
  elapsedSeconds: 0,
  
  startSession: (session) => set({
    activeSession: session,
    isRunning: true,
    elapsedSeconds: 0,
  }),
  finishSession: () => set({
    activeSession: null,
    isRunning: false,
    elapsedSeconds: 0,
  }),
  updateElapsed: (seconds) => set({ elapsedSeconds: seconds }),
  clearSession: () => set({
    activeSession: null,
    isRunning: false,
    elapsedSeconds: 0,
  }),
}));
