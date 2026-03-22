import { useUserStore } from '../stores/userStore';
import { Card } from '../components/ui/Card';

export default function ProfileScreen() {
  const { user } = useUserStore();

  if (!user) return null;

  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Profile
        </h1>
        <p className="text-text-secondary text-sm">
          Your focus journey
        </p>
      </header>

      {/* Profile Card */}
      <Card className="text-center">
        {user.photoUrl ? (
          <img
            src={user.photoUrl}
            alt={user.username || 'User'}
            className="w-24 h-24 rounded-full mx-auto mb-4 border-4 border-accent-primary/30"
          />
        ) : (
          <div className="w-24 h-24 rounded-full mx-auto mb-4 bg-gradient-primary flex items-center justify-center text-4xl">
            {user.firstName?.[0] || user.username?.[0] || '👤'}
          </div>
        )}
        
        <h2 className="text-xl font-bold text-text-primary">
          {user.username || user.firstName || 'Anonymous'}
        </h2>
        <p className="text-text-muted text-sm">
          Level {user.level}
        </p>
      </Card>

      {/* Stats */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Statistics
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="stat-card">
            <div className="stat-value text-gradient">{user.xp}</div>
            <div className="stat-label">Total XP</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-gradient">{user.level}</div>
            <div className="stat-label">Level</div>
          </div>
          <div className="stat-card">
            <div className="stat-value text-gradient">{user.streak}</div>
            <div className="stat-label">Day Streak</div>
          </div>
        </div>
      </Card>

      {/* Account Info */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Account
        </h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-text-secondary">Telegram ID</span>
            <span className="text-text-primary font-mono">{user.telegramId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-text-secondary">Member since</span>
            <span className="text-text-primary">
              {new Date(user.createdAt).toLocaleDateString()}
            </span>
          </div>
          {user.team && (
            <div className="flex justify-between">
              <span className="text-text-secondary">Team</span>
              <span className="text-accent-primary">{user.team.name}</span>
            </div>
          )}
        </div>
      </Card>

      {/* XP Progress to Next Level */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-text-primary">
            Progress to Level {user.level + 1}
          </h3>
          <span className="text-sm text-text-muted">
            {user.xp % 1000} / 1000 XP
          </span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${(user.xp % 1000) / 10}%` }}
          />
        </div>
      </Card>
    </div>
  );
}
