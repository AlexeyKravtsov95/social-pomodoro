import { Link, useLocation } from 'react-router-dom';

const navItems = [
  { path: '/', label: 'Фокус', icon: '⏱️' },
  { path: '/leaderboard', label: 'Топ', icon: '🏆' },
  { path: '/team', label: 'Команда', icon: '👥' },
  { path: '/profile', label: 'Профиль', icon: '👤' },
];

export default function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40">
      <div className="bg-background-secondary/95 backdrop-blur-lg border-t border-white/10">
        <div className="flex items-center justify-around py-2 pb-safe">
          {navItems.map((item) => {
            const isActive = location.pathname === item.path;
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'text-accent-primary'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                <span className="text-xl mb-1">{item.icon}</span>
                <span className="text-xs font-medium">{item.label}</span>
                {isActive && (
                  <div className="absolute -bottom-2 w-1 h-1 rounded-full bg-accent-primary" />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
