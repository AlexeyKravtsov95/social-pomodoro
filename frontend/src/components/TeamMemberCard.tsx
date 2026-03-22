import type { TeamMember } from '../types';

interface TeamMemberCardProps {
  member: TeamMember;
}

export function TeamMemberCard({ member }: TeamMemberCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-background-secondary/50 border border-white/5">
      {member.photoUrl ? (
        <img
          src={member.photoUrl}
          alt={member.username || 'User'}
          className="w-12 h-12 rounded-full border-2 border-white/10"
        />
      ) : (
        <div className="w-12 h-12 rounded-full bg-gradient-primary flex items-center justify-center text-lg">
          {member.firstName?.[0] || member.username?.[0] || '👤'}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-text-primary truncate">
            {member.username || member.firstName || 'Anonymous'}
          </span>
          {member.role === 'owner' && (
            <span className="badge badge-primary text-xs">Owner</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted mt-1">
          <span>{member.xp} XP</span>
          {member.streak > 0 && (
            <span className="flex items-center gap-1">
              🔥 {member.streak}d
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
