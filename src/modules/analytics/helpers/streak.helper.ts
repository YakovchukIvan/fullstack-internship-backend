import { StreakResult } from '../interfaces/analytics.interfaces';

function toDateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getYesterdayString(): string {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return toDateString(yesterday);
}

function getTodayString(): string {
  return toDateString(new Date());
}

export function calculateStreak(completedDates: Date[]): StreakResult {
  if (completedDates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, completedToday: false };
  }

  const uniqueDates = [...new Set(completedDates.map(toDateString))].sort((a, b) => (a > b ? -1 : 1));

  const today = getTodayString();
  const yesterday = getYesterdayString();
  const completedToday = uniqueDates[0] === today;

  let currentStreak = 0;
  const streakStart = completedToday ? today : yesterday;

  if (uniqueDates[0] === today || uniqueDates[0] === yesterday) {
    let expected = streakStart;

    for (const date of uniqueDates) {
      if (date === expected) {
        currentStreak++;
        const prev = new Date(expected);
        prev.setDate(prev.getDate() - 1);
        expected = toDateString(prev);
      } else {
        break;
      }
    }
  }

  let longestStreak = 0;
  let currentCount = 1;

  const sortedAsc = [...uniqueDates].sort();

  for (let i = 1; i < sortedAsc.length; i++) {
    const prev = new Date(sortedAsc[i - 1]);
    prev.setDate(prev.getDate() + 1);
    const expectedNext = toDateString(prev);

    if (sortedAsc[i] === expectedNext) {
      currentCount++;
      longestStreak = Math.max(longestStreak, currentCount);
    } else {
      currentCount = 1;
    }
  }

  longestStreak = Math.max(longestStreak, currentStreak, 1);

  return { currentStreak, longestStreak, completedToday };
}
