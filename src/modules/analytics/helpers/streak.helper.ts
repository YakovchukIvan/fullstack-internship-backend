import { StreakResult } from '../interfaces/streak.interfaces';

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function shiftDate(dateStr: string, days: number): string {
  const date = new Date(dateStr);
  date.setDate(date.getDate() + days);
  return toDateString(date);
}

export function calculateStreak(completedDates: Date[]): StreakResult {
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completedToday: false };
  }

  const uniqueDates = [...new Set(completedDates.map(toDateString))].sort().reverse();

  const today = toDateString(new Date());
  const completedToday = uniqueDates[0] === today;
  const streakAnchor = completedToday ? today : shiftDate(today, -1);

  let currentStreak = 0;
  let expected = streakAnchor;

  if (uniqueDates[0] === streakAnchor) {
    for (const date of uniqueDates) {
      if (date !== expected) {
        break;
      }
      currentStreak++;
      expected = shiftDate(expected, -1);
    }
  }

  const sortedAsc = [...uniqueDates].reverse();
  let longestStreak = 1;
  let currentRun = 1;

  for (let i = 1; i < sortedAsc.length; i++) {
    if (sortedAsc[i] === shiftDate(sortedAsc[i - 1], 1)) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak, completedToday };
}
