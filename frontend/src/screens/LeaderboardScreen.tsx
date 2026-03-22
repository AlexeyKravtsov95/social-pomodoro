import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { LeaderboardMember } from '../components/LeaderboardMember';

type LeaderboardTab = 'global' | 'team';

export default function LeaderboardScreen() {
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');

  const { data: globalData, isLoading: isLoadingGlobal } = useQuery({
    queryKey: ['leaderboard', 'global'],
    queryFn: () => api.leaderboard.getGlobal(),
    retry: 1,
  });

  const { data: teamData, isLoading: isLoadingTeam } = useQuery({
    queryKey: ['leaderboard', 'team'],
    queryFn: () => api.leaderboard.getTeam(),
    retry: 1,
    enabled: activeTab === 'team',
  });

  const isLoading = activeTab === 'global' ? isLoadingGlobal : isLoadingTeam;
  const error = activeTab === 'global' 
    ? globalData?.error 
    : teamData?.error;

  if (error) {
    return (
      <div className="p-4 space-y-4 animate-fade-in">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            Лидерборд
          </h1>
          <p className="text-text-secondary text-sm">
            Лучшие игроки
          </p>
        </header>
        <Card>
          <div className="text-center py-8 text-text-secondary">
            {activeTab === 'team' 
              ? 'Вы не в команде. Присоединитесь к команде, чтобы видеть рейтинг.'
              : 'Ошибка загрузки лидерборда'}
          </div>
        </Card>
      </div>
    );
  }

  const data = activeTab === 'global' ? globalData : teamData;
  const members = activeTab === 'global' 
    ? data?.leaderboard || [] 
    : data?.members || [];

  return (
    <div className="p-4 space-y-4 animate-fade-in pb-24">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-text-primary">
          Лидерборд
        </h1>
        <p className="text-text-secondary text-sm">
          {activeTab === 'global' ? 'Лучшие игроки' : 'Рейтинг команды'}
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setActiveTab('global')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'global'
              ? 'bg-gradient-primary text-white shadow-glow-sm'
              : 'bg-background-secondary text-text-secondary border border-white/10'
          }`}
        >
          Глобальный
        </button>
        <button
          onClick={() => setActiveTab('team')}
          className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
            activeTab === 'team'
              ? 'bg-gradient-primary text-white shadow-glow-sm'
              : 'bg-background-secondary text-text-secondary border border-white/10'
          }`}
        >
          Командный
        </button>
      </div>

      {/* Team Info (for team tab) */}
      {activeTab === 'team' && data?.teamName && (
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-text-primary">
                {data.teamName}
              </h3>
              <p className="text-sm text-text-muted">
                {members.length} участников
              </p>
            </div>
            <div className="text-right">
              <div className="text-sm text-text-muted">Прогресс</div>
              <div className="text-lg font-bold text-gradient">
                {data.weeklyProgress} / {data.weeklyGoal} XP
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Leaderboard List */}
      <Card className="p-0 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-text-secondary">
            Загрузка...
          </div>
        ) : members.length === 0 ? (
          <div className="p-8 text-center text-text-secondary">
            Пока нет участников
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {members.map((member: any) => (
              <LeaderboardMember
                key={member.id}
                member={member}
                isCurrentUser={member.telegramId === globalData?.currentUser.telegramId}
                highlightTop3={activeTab === 'global'}
              />
            ))}
          </div>
        )}
      </Card>

      {/* Current User Rank (global) */}
      {activeTab === 'global' && globalData?.currentUser && (
        <Card className="border-accent-primary/30 bg-accent-primary/5">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-sm font-bold text-white">
              {globalData.currentUser.rank}
            </div>
            <div className="flex-1">
              <div className="font-medium text-text-primary">
                {globalData.currentUser.username || globalData.currentUser.firstName || 'Вы'}
              </div>
              <div className="text-sm text-text-muted">
                Уровень {globalData.currentUser.level}
              </div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gradient">
                {globalData.currentUser.xp} XP
              </div>
              <div className="text-xs text-text-muted">
                🔥 {globalData.currentUser.streak}дн.
              </div>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}
