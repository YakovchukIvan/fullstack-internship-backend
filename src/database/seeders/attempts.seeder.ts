import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { addDays, addMinutes, addSeconds } from 'date-fns';
import { User } from '@/modules/users/entities/user.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { Quiz } from '@/modules/companies/quizzes/entities/quiz.entity';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import { AppLogger } from '@/common/logger/app-logger';

const ATTEMPTS_START_DATE = new Date('2025-03-01T00:00:00.000Z');

type ActivityPattern = 'daily_active' | 'regular' | 'weekly' | 'inactive';

interface PatternConfig {
  dailyProbability: number;
  quizzesPerDay: { min: number; max: number };
}

const PATTERN_CONFIG: Record<ActivityPattern, PatternConfig> = {
  daily_active: {
    dailyProbability: 0.9,
    quizzesPerDay: { min: 4, max: 5 },
  },
  regular: {
    dailyProbability: 0.55,
    quizzesPerDay: { min: 2, max: 3 },
  },
  weekly: {
    dailyProbability: 1 / 7,
    quizzesPerDay: { min: 3, max: 5 },
  },
  inactive: {
    dailyProbability: 0,
    quizzesPerDay: { min: 0, max: 0 },
  },
};

const PATTERN_WEIGHTS: ActivityPattern[] = [
  'daily_active',
  'daily_active',
  'regular',
  'regular',
  'regular',
  'regular',
  'weekly',
  'weekly',
  'inactive',
];

function assignPattern(): ActivityPattern {
  return faker.helpers.arrayElement<ActivityPattern>(PATTERN_WEIGHTS);
}

function calcTotalPoints(pattern: ActivityPattern, maxPoints: number): number {
  const pct =
    pattern === 'daily_active'
      ? faker.number.int({ min: 75, max: 100 })
      : pattern === 'regular'
        ? faker.number.int({ min: 50, max: 85 })
        : faker.number.int({ min: 20, max: 65 });

  return Number(((maxPoints * pct) / 100).toFixed(4));
}

export async function seedAttempts(
  dataSource: DataSource,
  users: User[],
  companies: Company[],
  allQuizzes: Quiz[],
  companyMembersMap: Map<string, string[]>,
  logger: AppLogger,
): Promise<void> {
  const today = new Date();
  const totalDays = Math.floor((today.getTime() - ATTEMPTS_START_DATE.getTime()) / (1000 * 60 * 60 * 24));

  logger.log(`Generating quiz attempts (${totalDays} days, 2025-03-01 to today)...`, 'AttemptsSeeder');

  const userPatternMap = new Map<string, ActivityPattern>();
  for (const u of users) {
    userPatternMap.set(u.id, assignPattern());
  }

  const attemptsData: Partial<QuizAttempt>[] = [];

  for (const company of companies) {
    const companyQuizzes = allQuizzes.filter((q) => q.companyId === company.id);
    if (companyQuizzes.length === 0) {
      continue;
    }

    const memberIds = companyMembersMap.get(company.id) ?? [];

    for (const userId of memberIds) {
      const pattern = userPatternMap.get(userId) ?? 'regular';
      if (pattern === 'inactive') {
        continue;
      }

      const config = PATTERN_CONFIG[pattern];

      for (let day = 0; day <= totalDays; day++) {
        const currentDate = addDays(ATTEMPTS_START_DATE, day);

        const willBeActive = faker.datatype.boolean({ probability: config.dailyProbability });
        if (!willBeActive) {
          continue;
        }

        const quizCount = faker.number.int({
          min: config.quizzesPerDay.min,
          max: Math.min(config.quizzesPerDay.max, companyQuizzes.length),
        });

        const quizzesToTake = faker.helpers.arrayElements(companyQuizzes, quizCount);

        for (const quiz of quizzesToTake) {
          const maxPossiblePoints = quiz.questions.length;
          const timeLimitSeconds = quiz.timeLimitMinutes * 60;
          const maxDuration = Math.max(timeLimitSeconds - 10, 30);

          const createdAt = addMinutes(currentDate, faker.number.int({ min: 0, max: 23 * 60 }));
          const durationSeconds = faker.number.int({ min: 30, max: maxDuration });
          const completedAt = addSeconds(createdAt, durationSeconds);

          attemptsData.push({
            userId,
            quizId: quiz.id,
            companyId: company.id,
            totalPoints: calcTotalPoints(pattern, maxPossiblePoints),
            maxPossiblePoints,
            durationSeconds,
            createdAt,
            completedAt,
          });
        }
      }
    }
  }

  logger.log(`Saving ${attemptsData.length} attempts in chunks...`, 'AttemptsSeeder');

  const CHUNK = 5000;
  for (let i = 0; i < attemptsData.length; i += CHUNK) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(QuizAttempt)
      .values(attemptsData.slice(i, i + CHUNK) as QuizAttempt[])
      .execute();
  }

  logger.log(`${attemptsData.length} attempts created`, 'AttemptsSeeder');
}
