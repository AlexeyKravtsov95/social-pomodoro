import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../lib/api';
import { Card } from './ui/Card';

interface Quest {
  id: number;
  name: string;
  description: string;
  type: string;
  target: number;
  xpReward: number;
  progress: number;
  completed: boolean;
}

export function DailyQuests() {
  const queryClient = useQueryClient();
  
  const { data, isLoading } = useQuery({
    queryKey: ['quests', 'daily'],
    queryFn: () => api.quest.getDaily(),
    retry: 1,
  });
  
  const quests: Quest[] = data?.quests || [];
  
  if (isLoading) {
    return (
      <Card>
        <div className="text-center py-4 text-text-secondary">
          Загрузка квестов...
        </div>
      </Card>
    );
  }
  
  if (quests.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">📋</span>
        <h3 className="text-lg font-semibold text-text-primary">
          Ежедневные квесты
        </h3>
      </div>
      
      <div className="space-y-3">
        {quests.map((quest) => (
          <div
            key={quest.id}
            className={`p-3 rounded-xl border transition-all ${
              quest.completed
                ? 'bg-accent-success/10 border-accent-success/30'
                : 'bg-background-secondary border-white/5'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex-1">
                <div className="font-medium text-text-primary">
                  {quest.name}
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  {quest.description}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-bold ${
                  quest.completed
                    ? 'text-accent-success'
                    : 'text-accent-primary'
                }`}>
                  +{quest.xpReward} XP
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="flex-1 progress-bar h-2">
                <div
                  className={`progress-bar-fill ${
                    quest.completed ? 'bg-accent-success' : ''
                  }`}
                  style={{ width: `${(quest.progress / quest.target) * 100}%` }}
                />
              </div>
              <div className="text-xs text-text-muted whitespace-nowrap">
                {quest.progress} / {quest.target}
              </div>
            </div>
            
            {quest.completed && (
              <div className="flex items-center gap-1 mt-2 text-xs text-accent-success">
                <span>✓</span>
                <span>Выполнено!</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </Card>
  );
}
