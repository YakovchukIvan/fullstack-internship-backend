export function calculateAccuracy(totalPoints: number, maxPossiblePoints: number): number {
  return Number(((totalPoints / maxPossiblePoints) * 100).toFixed(2));
}

export function calculateRating(totalPoints: number, maxPossiblePoints: number): number {
  if (maxPossiblePoints === 0) {
    return 0;
  }
  return Number((totalPoints / maxPossiblePoints).toFixed(4));
}
