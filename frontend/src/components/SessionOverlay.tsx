import { useSessionStore } from '../stores/sessionStore';
import { formatTime } from '../lib/utils';

export default function SessionOverlay() {
  const { activeSession, elapsedSeconds } = useSessionStore();

  if (!activeSession) return null;

  const remaining = Math.max(0, activeSession.duration * 60 - elapsedSeconds);
  const progress = (elapsedSeconds / (activeSession.duration * 60)) * 100;

  return (
    <div className="fixed top-4 left-4 right-4 z-30 animate-slide-down">
      <div className="bg-background-tertiary/95 backdrop-blur-lg rounded-2xl p-4 border border-white/10 shadow-glow">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-slow">
              ⏱️
            </div>
            <div>
              <div className="text-sm font-medium text-text-primary">
                Focus in progress
              </div>
              <div className="text-xs text-text-muted">
                +{activeSession.xpEarned} XP
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-lg font-bold text-text-primary font-mono">
              {formatTime(remaining)}
            </div>
            <div className="text-xs text-text-muted">
              remaining
            </div>
          </div>
        </div>
        <div className="mt-3 progress-bar h-1.5">
          <div
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
