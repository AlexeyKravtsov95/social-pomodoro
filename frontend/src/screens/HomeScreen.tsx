import { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { useSessionStore } from '../stores/sessionStore';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { ProgressBar } from '../components/ui/ProgressBar';
import { DailyQuests } from '../components/DailyQuests';
import { formatTime } from '../lib/utils';

const DURATIONS = [
  { value: 15, label: '15 min', xp: 150 },
  { value: 25, label: '25 min', xp: 250 },
  { value: 45, label: '45 min', xp: 450 },
  { value: 60, label: '60 min', xp: 600 },
];

export default function HomeScreen() {
  const { user, updateUser } = useUserStore();
  const { activeSession, isRunning, elapsedSeconds, startSession, finishSession } = useSessionStore();
  const [selectedDuration, setSelectedDuration] = useState(25);
  const [isStarting, setIsStarting] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const handleStart = async () => {
    try {
      console.log('Starting session with duration:', selectedDuration);
      setIsStarting(true);
      const session = await api.session.start(selectedDuration);
      console.log('Session started:', session);
      startSession(session);

      // Haptic feedback
      window.Telegram?.WebApp?.HapticFeedback?.impactOccurred('medium');
    } catch (error) {
      console.error('Failed to start session:', error);
      window.Telegram?.WebApp?.showAlert('Failed to start: ' + (error as Error).message);
    } finally {
      setIsStarting(false);
    }
  };

  const handleFinish = async () => {
    try {
      setIsFinishing(true);
      if (!activeSession) return;
      
      const result = await api.session.finish(activeSession.id);
      
      // Update user XP and streak
      if (result.user) {
        updateUser({
          xp: result.user.xp,
          level: result.user.level,
          streak: result.user.streak,
        });
      }
      
      finishSession();
      
      // Haptic feedback
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      
      // Show completion popup
      if (result.isValid) {
        window.Telegram?.WebApp?.showPopup({
          title: '🎉 Фокус завершён!',
          message: `Вы получили ${result.xpEarned} XP!`,
          buttons: [{ type: 'ok' }],
        });
      }
    } catch (error) {
      console.error('Failed to finish session:', error);
      window.Telegram?.WebApp?.showAlert('Failed to finish session. Please try again.');
    } finally {
      setIsFinishing(false);
    }
  };

  const progress = activeSession
    ? Math.min((elapsedSeconds / (activeSession.duration * 60)) * 100, 100)
    : 0;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Фокус-сессия
          </h1>
          <p className="text-text-secondary text-sm">
            Копи XP, поддерживай стрик
          </p>
        </div>
        {user && (
          <div className="text-right">
            <div className="text-2xl font-bold text-gradient">
              {user.xp} XP
            </div>
            <div className="text-xs text-text-muted">
              Level {user.level}
            </div>
          </div>
        )}
      </header>

      {/* Active Session or Duration Selection */}
      {activeSession ? (
        <Card className="text-center py-8">
          <div className="mb-6">
            <div className="text-6xl font-bold text-text-primary mb-2 font-mono">
              {formatTime(elapsedSeconds)}
            </div>
            <div className="text-text-secondary">
              / {formatTime(activeSession.duration * 60)}
            </div>
          </div>
          
          <ProgressBar value={progress} className="mb-6" />
          
          <div className="flex items-center justify-center gap-2 text-text-muted text-sm mb-6">
            <span className="badge badge-success">+{activeSession.xpEarned} XP</span>
            {isRunning && <span className="animate-pulse">● Running</span>}
          </div>
          
          <Button
            onClick={handleFinish}
            disabled={isFinishing}
            variant="primary"
            className="w-full"
          >
            {isFinishing ? 'Завершение...' : 'Завершить фокус'}
          </Button>
        </Card>
      ) : (
        <>
          {/* Duration Selection */}
          <Card>
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              Выберите длительность
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {DURATIONS.map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => setSelectedDuration(duration.value)}
                  className={`p-4 rounded-xl border transition-all duration-200 ${
                    selectedDuration === duration.value
                      ? 'bg-gradient-primary border-transparent shadow-glow-sm'
                      : 'bg-background-secondary border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className={`text-lg font-bold ${
                    selectedDuration === duration.value
                      ? 'text-white'
                      : 'text-text-primary'
                  }`}>
                    {duration.label}
                  </div>
                  <div className={`text-xs mt-1 ${
                    selectedDuration === duration.value
                      ? 'text-white/80'
                      : 'text-text-muted'
                  }`}>
                    +{duration.xp} XP
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Streak Card */}
          {user && user.streak > 0 && (
            <Card>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-2xl">
                  🔥
                </div>
                <div>
                  <div className="text-2xl font-bold text-text-primary">
                    {user.streak} дн.
                  </div>
                  <div className="text-text-secondary text-sm">
                    Текущий стрик
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Daily Quests */}
          <DailyQuests />

          {/* Team Progress */}
          {user?.team && (
            <Card>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-text-primary">
                  Цель команды
                </h3>
                <span className="text-sm text-text-muted">
                  {user.team.weeklyProgress} / {user.team.weeklyGoal} XP
                </span>
              </div>
              <ProgressBar
                value={(user.team.weeklyProgress / user.team.weeklyGoal) * 100}
              />
              <p className="text-xs text-text-muted mt-3">
                Ваш вклад помогает всей команде!
              </p>
            </Card>
          )}

          {/* Start Button */}
          <Button
            onClick={handleStart}
            disabled={isStarting}
            variant="primary"
            className="w-full py-4 text-lg"
          >
            {isStarting ? 'Запуск...' : 'Начать фокус'}
          </Button>
        </>
      )}
    </div>
  );
}
