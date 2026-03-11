import { ReactNode } from 'react';

interface AppShellProps {
  children: ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
}

export function AppShell({ children, title, showBack, onBack }: AppShellProps) {
  return (
    <div className="min-h-screen safe-top safe-bottom">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-md border-b border-white/20">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {showBack && (
              <button
                onClick={onBack}
                className="p-2 -ml-2 text-white/80 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )}
            <h1 className="text-lg font-semibold text-white">
              {title || 'Focus Guild'}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Level badge */}
            <div className="px-2 py-1 bg-white/20 rounded-full text-xs text-white font-medium">
              Lvl 1
            </div>
          </div>
        </div>
      </header>
      
      {/* Content */}
      <main className="px-4 py-6">
        {children}
      </main>
      
      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/10 backdrop-blur-md border-t border-white/20 safe-bottom">
        <div className="flex items-center justify-around py-2">
          <NavItem icon="timer" label="Focus" active />
          <NavItem icon="users" label="Team" />
          <NavItem icon="trophy" label="Rank" />
          <NavItem icon="user" label="Profile" />
        </div>
      </nav>
      
      {/* Bottom spacer for nav */}
      <div className="h-20" />
    </div>
  );
}

interface NavItemProps {
  icon: string;
  label: string;
  active?: boolean;
}

function NavItem({ icon, label, active }: NavItemProps) {
  return (
    <button className={`flex flex-col items-center gap-1 px-4 py-2 transition-colors ${
      active ? 'text-white' : 'text-white/60 hover:text-white/80'
    }`}>
      <Icon name={icon} />
      <span className="text-xs">{label}</span>
    </button>
  );
}

function Icon({ name }: { name: string }) {
  const icons: Record<string, JSX.Element> = {
    timer: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    users: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    trophy: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
      </svg>
    ),
    user: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  };
  
  return icons[name] || null;
}
