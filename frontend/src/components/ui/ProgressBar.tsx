interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showLabel?: boolean;
}

export function ProgressBar({
  value,
  max = 100,
  className = '',
  showLabel = false,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  return (
    <div className={`w-full ${className}`}>
      {showLabel && (
        <div className="flex justify-between text-xs text-text-muted mb-1">
          <span>{Math.round(value)}</span>
          <span>{Math.round(max)}</span>
        </div>
      )}
      <div className="progress-bar">
        <div
          className="progress-bar-fill"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
