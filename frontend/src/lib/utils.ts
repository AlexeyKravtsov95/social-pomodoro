/**
 * Format seconds to MM:SS or HH:MM:SS
 */
export function formatTime(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Format XP with K/M suffix
 */
export function formatXP(xp: number): string {
  if (xp >= 1000000) {
    return `${(xp / 1000000).toFixed(1)}M`;
  }
  if (xp >= 1000) {
    return `${(xp / 1000).toFixed(1)}K`;
  }
  return xp.toString();
}

/**
 * Calculate level from XP
 */
export function calculateLevel(xp: number): number {
  return Math.floor(xp / 1000) + 1;
}

/**
 * Get progress to next level
 */
export function getLevelProgress(xp: number): number {
  return xp % 1000;
}
