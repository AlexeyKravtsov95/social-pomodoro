interface LeaderboardMemberProps {
  member: {
    rank: number;
    id: number;
    username: string | null;
    firstName: string | null;
    lastName: string | null;
    photoUrl: string | null;
    xp: number;
    level: number;
    streak: number;
    teamName?: string | null;
    role?: string;
  };
  isCurrentUser?: boolean;
  highlightTop3?: boolean;
}

export function LeaderboardMember({
  member,
  isCurrentUser = false,
  highlightTop3 = true,
}: LeaderboardMemberProps) {
  const getRankStyle = () => {
    if (!highlightTop3) return '';
    if (member.rank === 1) return 'bg-yellow-500/20 border-yellow-500/50';
    if (member.rank === 2) return 'bg-gray-400/20 border-gray-400/50';
    if (member.rank === 3) return 'bg-amber-700/20 border-amber-700/50';
    return '';
  };

  const getRankIcon = () => {
    if (!highlightTop3) return null;
    if (member.rank === 1) return '🥇';
    if (member.rank === 2) return '🥈';
    if (member.rank === 3) return '🥉';
    return null;
  };

  return (
    <div
      className={`flex items-center gap-4 p-4 transition-all ${
        isCurrentUser ? 'bg-accent-primary/10' : ''
      } ${getRankStyle()}`}
    >
      {/* Rank */}
      <div className="w-8 h-8 flex items-center justify-center">
        {getRankIcon() ? (
          <span className="text-xl">{getRankIcon()}</span>
        ) : (
          <span className={`text-sm font-medium ${
            member.rank <= 10 ? 'text-text-primary' : 'text-text-muted'
          }`}>
            {member.rank}
          </span>
        )}
      </div>

      {/* Avatar */}
      {member.photoUrl ? (
        <img
          src={member.photoUrl}
          alt={member.username || 'User'}
          className="w-10 h-10 rounded-full border-2 border-white/10"
        />
      ) : (
        <div className="w-10 h-10 rounded-full bg-gradient-primary flex items-center justify-center text-sm font-bold">
          {member.firstName?.[0] || member.username?.[0] || '?'}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary truncate">
            {member.username || member.firstName || 'Anonymous'}
          </span>
          {isCurrentUser && (
            <span className="badge badge-primary text-xs">Вы</span>
          )}
          {member.role === 'owner' && (
            <span className="badge badge-primary text-xs">Owner</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted mt-0.5">
          <span>Уровень {member.level}</span>
          {member.teamName && (
            <span>• {member.teamName}</span>
          )}
        </div>
      </div>

      {/* XP & Streak */}
      <div className="text-right">
        <div className="font-bold text-gradient">
          {member.xp.toLocaleString()} XP
        </div>
        {member.streak > 0 && (
          <div className="text-xs text-text-muted mt-0.5">
            🔥 {member.streak}дн.
          </div>
        )}
      </div>
    </div>
  );
}
