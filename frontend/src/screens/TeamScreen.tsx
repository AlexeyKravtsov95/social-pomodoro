import { useState } from 'react';
import { useUserStore } from '../stores/userStore';
import { api } from '../lib/api';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { TeamMemberCard } from '../components/TeamMemberCard';

export default function TeamScreen() {
  const { user, updateUser } = useUserStore();
  const [isCreating, setIsCreating] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamDescription, setTeamDescription] = useState('');
  const [inviteCode, setInviteCode] = useState('');

  const handleCreateTeam = async () => {
    try {
      setIsCreating(true);
      const team = await api.team.create(teamName, teamDescription || undefined);
      updateUser({ teamId: team.id, team: {
        id: team.id,
        name: team.name,
        weeklyGoal: team.weeklyGoal,
        weeklyProgress: team.weeklyProgress,
      }});
      setTeamName('');
      setTeamDescription('');
    } catch (error) {
      console.error('Failed to create team:', error);
      window.Telegram?.WebApp?.showAlert('Failed to create team');
    } finally {
      setIsCreating(false);
    }
  };

  const handleJoinTeam = async () => {
    try {
      setIsJoining(true);
      const team = await api.team.join(inviteCode);
      updateUser({ teamId: team.id, team: {
        id: team.id,
        name: team.name,
        weeklyGoal: team.weeklyGoal,
        weeklyProgress: team.weeklyProgress,
      }});
      setInviteCode('');
    } catch (error) {
      console.error('Failed to join team:', error);
      window.Telegram?.WebApp?.showAlert('Invalid invite code');
    } finally {
      setIsJoining(false);
    }
  };

  const handleCopyInvite = () => {
    if (user?.team?.inviteCode) {
      const inviteLink = `https://t.me/your_bot?start=${user.team.inviteCode}`;
      navigator.clipboard.writeText(inviteLink);
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success');
      window.Telegram?.WebApp?.showPopup({
        title: 'Invite Link Copied!',
        message: 'Share this link with your friends',
        buttons: [{ type: 'ok' }],
      });
    }
  };

  // Not in a team - show create/join options
  if (!user?.teamId) {
    return (
      <div className="p-4 space-y-4 animate-fade-in">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary">
            Присоединиться к команде
          </h1>
          <p className="text-text-secondary text-sm">
            Фокусируйтесь вместе, растите вместе
          </p>
        </header>

        <Card>
          <div className="text-center py-6">
            <div className="text-5xl mb-4">🏆</div>
            <h2 className="text-xl font-semibold text-text-primary mb-2">
              Зачем нужна команда?
            </h2>
            <ul className="text-left text-text-secondary text-sm space-y-2 mt-4">
              <li>✓ Вклад в недельные цели</li>
              <li>✓ Соревнование в лидерборде</li>
              <li>✓ Ответственность перед друзьями</li>
              <li>✓ Бонусный XP вместе</li>
            </ul>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Создать новую команду
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Название команды"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              maxLength={50}
            />
            <Input
              placeholder="Описание (необязательно)"
              value={teamDescription}
              onChange={(e) => setTeamDescription(e.target.value)}
              maxLength={200}
            />
            <Button
              onClick={handleCreateTeam}
              disabled={isCreating || !teamName.trim()}
              variant="primary"
              className="w-full"
            >
              {isCreating ? 'Создание...' : 'Создать команду'}
            </Button>
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            Вступить в команду
          </h3>
          <div className="space-y-3">
            <Input
              placeholder="Введите код приглашения"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={10}
            />
            <Button
              onClick={handleJoinTeam}
              disabled={isJoining || !inviteCode.trim()}
              variant="secondary"
              className="w-full"
            >
              {isJoining ? 'Вступление...' : 'Вступить в команду'}
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  // In a team - show team details
  return (
    <div className="p-4 space-y-4 animate-fade-in">
      <header className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            {user.team?.name || 'Моя команда'}
          </h1>
          <p className="text-text-secondary text-sm">
            {user.team?.members?.length || 0} участников
          </p>
        </div>
        <button
          onClick={handleCopyInvite}
          className="btn-secondary text-sm"
        >
          Пригласить
        </button>
      </header>

      {/* Weekly Progress */}
      <Card>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold text-text-primary">
            Недельная цель
          </h3>
          <span className="text-sm text-text-muted">
            {user.team?.weeklyProgress || 0} / {user.team?.weeklyGoal || 1000} XP
          </span>
        </div>
        <div className="progress-bar mb-3">
          <div
            className="progress-bar-fill"
            style={{ width: `${((user.team?.weeklyProgress || 0) / (user.team?.weeklyGoal || 1000)) * 100}%` }}
          />
        </div>
        <p className="text-xs text-text-muted">
          Продолжайте фокусироваться, чтобы достичь цели!
        </p>
      </Card>

      {/* Team Members */}
      <Card>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          Участники
        </h3>
        <div className="space-y-3">
          {user.team?.members?.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      </Card>

      {/* Invite Code */}
      <Card>
        <div className="text-center">
          <p className="text-text-secondary text-sm mb-2">
            Код приглашения в вашу команду:
          </p>
          <div className="text-2xl font-bold text-gradient mb-3">
            {user.team?.inviteCode}
          </div>
          <Button onClick={handleCopyInvite} variant="secondary" className="w-full">
            Скопировать ссылку
          </Button>
        </div>
      </Card>
    </div>
  );
}
