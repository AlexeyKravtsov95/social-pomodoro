import { useState, useEffect } from 'react';
import { AppShell } from '../components/AppShell';
import { useAppStore } from '../store/useAppStore';
import { useTelegram } from '../hooks/useTelegram';
import { api } from '../lib/api';

export function Home() {
  const { user, token, setToken, setUser } = useAppStore();
  const { initData, isReady } = useTelegram();
  const [loading, setLoading] = useState(true);
  const [sessionActive, setSessionActive] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [plannedMinutes, setPlannedMinutes] = useState(25);

  // Authenticate on mount
  useEffect(() => {
    if (!isReady) return;
    
    const storedToken = localStorage.getItem('token');
    
    if (storedToken && initData) {
      // Try to get user with stored token
      api.auth.me(storedToken)
        .then((res) => {
          setUser(res.user);
          setToken(storedToken);
          setLoading(false);
        })
        .catch(() => {
          // Token invalid, re-authenticate
          authenticate();
        });
    } else if (initData) {
      authenticate();
    } else {
      setLoading(false);
    }
  }, [isReady, initData]);

  // Check for active session
  useEffect(() => {
    if (!token) return;
    
    api.sessions.getActive(token)
      .then((res) => {
        if (res.active && res.session) {
          setSessionActive(true);
          setSessionTime(res.session.elapsedSeconds || 0);
        }
      })
      .catch(console.error);
  }, [token]);

  // Timer countdown
  useEffect(() => {
    if (!sessionActive) return;
    
    const interval = setInterval(() => {
      setSessionTime((prev) => prev + 1);
    }, 1000);
    
    return () => clearInterval(interval);
  }, [sessionActive]);

  const authenticate = async () => {
    if (!initData) return;
    
    try {
      const res = await api.auth.login(initData);
      if (res.success) {
        setUser(res.user);
        setToken(res.token);
        localStorage.setItem('token', res.token);
      }
    } catch (error) {
      console.error('Auth failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSession = async () => {
    if (!token) return;
    
    try {
      const res = await api.sessions.start(token, plannedMinutes);
      if (res.success) {
        setSessionActive(true);
        setSessionTime(0);
      }
    } catch (error) {
      console.error('Failed to start session:', error);
    }
  };

  const finishSession = async () => {
    if (!token || sessionTime < 300) { // Minimum 5 minutes
      alert('Please focus for at least 5 minutes');
      return;
    }
    
    // In real app, get session ID from state
    const sessionId = 1; // Placeholder
    
    try {
      const res = await api.sessions.finish(token, sessionId);
      if (res.success) {
        setSessionActive(false);
        setSessionTime(0);
        alert(`Session complete! +${res.xpEarned} XP`);
      }
    } catch (error) {
      console.error('Failed to finish session:', error);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <AppShell title="Focus Guild">
      <div className="space-y-6">
        {/* User greeting */}
        <div className="text-center text-white">
          <h2 className="text-2xl font-bold">
            Welcome{user?.firstName ? `, ${user.firstName}` : ''}!
          </h2>
          <p className="text-white/70 mt-1">
            Level {user?.level || 1} • {user?.xp || 0} XP
          </p>
        </div>

        {/* Session card */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
          {sessionActive ? (
            <div className="text-center space-y-4">
              <div className="text-6xl font-mono font-bold text-white">
                {formatTime(sessionTime)}
              </div>
              <p className="text-white/70">Focus in progress...</p>
              <button
                onClick={finishSession}
                className="w-full py-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-xl transition-colors"
              >
                Finish Session
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-center">
                <p className="text-white/70 mb-2">Select duration</p>
                <div className="flex gap-2 justify-center">
                  {[15, 25, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      onClick={() => setPlannedMinutes(mins)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                        plannedMinutes === mins
                          ? 'bg-white text-purple-600'
                          : 'bg-white/20 text-white hover:bg-white/30'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>
              </div>
              <button
                onClick={startSession}
                className="w-full py-4 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold text-lg rounded-xl transition-all shadow-lg"
              >
                Start Focus Session
              </button>
            </div>
          )}
        </div>

        {/* Team progress */}
        <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20">
          <h3 className="text-white font-semibold mb-3">Team Weekly Goal</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm text-white/70">
              <span>Progress</span>
              <span>0 / 100 min</span>
            </div>
            <div className="h-3 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-0 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full" />
            </div>
          </div>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-sm">Streak</p>
            <p className="text-2xl font-bold text-white">{user?.streak || 0} days</p>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20">
            <p className="text-white/70 text-sm">Sessions</p>
            <p className="text-2xl font-bold text-white">0</p>
          </div>
        </div>

        {/* No team state */}
        {!user?.teams?.length && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 text-center">
            <p className="text-white font-semibold mb-2">No team yet</p>
            <p className="text-white/70 text-sm mb-4">
              Join a team to unlock co-op progress and weekly goals!
            </p>
            <div className="flex gap-2">
              <button className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors">
                Create Team
              </button>
              <button className="flex-1 py-2 bg-white/20 hover:bg-white/30 text-white font-medium rounded-lg transition-colors">
                Join Team
              </button>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
