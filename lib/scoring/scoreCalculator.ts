export function calculateScore(pickups: number, streakDays: number): number {
  const base = 100
  const penalty = pickups * 20
  const multiplier = 1 + Math.min(streakDays * 0.05, 1.0)
  return Math.max(0, base - penalty) * multiplier
}
