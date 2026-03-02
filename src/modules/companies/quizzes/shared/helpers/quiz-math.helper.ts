export function calculateAccuracy(totalPoints: number, maxPossiblePoints: number): number {
  return Number(((totalPoints / maxPossiblePoints) * 100).toFixed(2));
}
