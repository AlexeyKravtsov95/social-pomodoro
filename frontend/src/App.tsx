import { useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useUserStore } from './stores/userStore';
import { useSessionStore } from './stores/sessionStore';
import { api } from './lib/api';

// Screens
import HomeScreen from './screens/HomeScreen';
import TeamScreen from './screens/TeamScreen';
import ProfileScreen from './screens/ProfileScreen';
import LeaderboardScreen from './screens/LeaderboardScreen';

// Components
import BottomNav from './components/BottomNav';
import SessionOverlay from './components/SessionOverlay';

function App() {
  const { setUser, setLoading, error } = useUserStore();
  const { activeSession } = useSessionStore();

  useEffect(() => {
    async function init() {
      // Initialize Telegram WebApp
      if (window.Telegram?.WebApp) {
        window.Telegram.WebApp.ready();
        window.Telegram.WebApp.expand();
      }

      try {
        setLoading(true);
        const user = await api.user.getMe();
        setUser(user);
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  // Check for active session on mount
  useEffect(() => {
    async function checkActiveSession() {
      try {
        const data = await api.session.getActive();
        if (data.active && data.session) {
          useSessionStore.getState().startSession({
            id: data.session.id,
            duration: data.session.duration,
            startedAt: data.session.startedAt,
            xpEarned: data.session.xpEarned,
          });
          useSessionStore.getState().updateElapsed(data.session.elapsedSeconds);
        }
      } catch (err) {
        console.error('Failed to check active session:', err);
      }
    }

    checkActiveSession();
  }, []);

  // Timer for active session
  useEffect(() => {
    if (!activeSession) return;

    const interval = setInterval(() => {
      const startedAt = new Date(activeSession.startedAt).getTime();
      const now = Date.now();
      const elapsed = Math.floor((now - startedAt) / 1000);
      useSessionStore.getState().updateElapsed(elapsed);
    }, 1000);

    return () => clearInterval(interval);
  }, [activeSession?.id]);

  if (error === 'Missing Telegram auth') {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            Open in Telegram
          </h1>
          <p className="text-text-secondary">
            This app only works inside Telegram
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary pb-24">
      {/* Background glow effect */}
      <div className="fixed inset-0 bg-gradient-glow pointer-events-none" />
      
      {/* Session Overlay */}
      {activeSession && <SessionOverlay />}
      
      {/* Main Content */}
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<HomeScreen />} />
          <Route path="/team" element={<TeamScreen />} />
          <Route path="/leaderboard" element={<LeaderboardScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
        </Routes>
      </main>
      
      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

export default App;
