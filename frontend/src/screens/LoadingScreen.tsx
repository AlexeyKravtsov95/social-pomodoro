import { useUserStore } from '../stores/userStore';

export default function LoadingScreen() {
  const { isLoading } = useUserStore();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-background-primary z-50 flex items-center justify-center">
      <div className="text-center">
        {/* Animated logo placeholder */}
        <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-primary animate-pulse-slow shadow-glow" />
        <p className="text-text-secondary animate-pulse">Loading...</p>
      </div>
    </div>
  );
}
