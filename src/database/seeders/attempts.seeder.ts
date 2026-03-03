import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { subDays, addMinutes } from 'date-fns';
import { User } from '@/modules/users/entities/user.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { Quiz } from '@/modules/companies/quizzes/entities/quiz.entity';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import { AppLogger } from '@/common/logger/app-logger';

type UserType = 'excellent' | 'average' | 'poor' | 'inactive';

function assignUserType(): UserType {
  return faker.helpers.arrayElement<UserType>([
    'excellent',
    'excellent',
    'average',
    'average',
    'average',
    'poor',
    'inactive',
  ]);
}

function calcTotalPoints(userType: UserType, maxPoints: number): number {
  const pct =
    userType === 'excellent'
      ? faker.number.int({ min: 85, max: 100 })
      : userType === 'average'
        ? faker.number.int({ min: 50, max: 84 })
        : faker.number.int({ min: 10, max: 49 });

  return Number(((maxPoints * pct) / 100).toFixed(4));
}

function activityProbability(userType: UserType): number {
  if (userType === 'excellent') {
    return 0.85;
  }
  if (userType === 'average') {
    return 0.5;
  }
  if (userType === 'poor') {
    return 0.15;
  }
  return 0;
}

export async function seedAttempts(
  dataSource: DataSource,
  users: User[],
  companies: Company[],
  allQuizzes: Quiz[],
  companyMembersMap: Map<string, string[]>,
  logger: AppLogger,
): Promise<void> {
  logger.log('🎯 Generating quiz attempts (60 days)...', 'AttemptsSeeder');

  const DAYS = 60;
  const TODAY = new Date();

  const userTypeMap = new Map<string, UserType>();
  for (const u of users) {
    userTypeMap.set(u.id, assignUserType());
  }

  const attemptsData: Partial<QuizAttempt>[] = [];

  for (const company of companies) {
    const companyQuizzes = allQuizzes.filter((q) => q.companyId === company.id);
    const memberIds = companyMembersMap.get(company.id) ?? [];

    for (const userId of memberIds) {
      const userType = userTypeMap.get(userId) ?? 'average';
      if (userType === 'inactive') {
        continue;
      }

      const probability = activityProbability(userType);

      for (let day = DAYS; day >= 0; day--) {
        const currentDate = subDays(TODAY, day);
        const willBeActive = faker.datatype.boolean({ probability });
        if (!willBeActive) {
          continue;
        }

        const quizzesToTake = faker.helpers.arrayElements(
          companyQuizzes,
          faker.number.int({ min: 1, max: Math.min(5, companyQuizzes.length) }),
        );

        for (const quiz of quizzesToTake) {
          const maxPossiblePoints = quiz.questions.length;

          const timeLimitSeconds = quiz.timeLimitMinutes * 60;
          const maxDuration = Math.max(timeLimitSeconds - 10, 30);

          attemptsData.push({
            userId,
            quizId: quiz.id,
            companyId: company.id,
            totalPoints: calcTotalPoints(userType, maxPossiblePoints),
            maxPossiblePoints,
            durationSeconds: faker.number.int({ min: 30, max: maxDuration }),
            completedAt: addMinutes(currentDate, faker.number.int({ min: 1, max: 600 })),
          });
        }
      }
    }
  }

  logger.log(`⏳ Saving ${attemptsData.length} attempts in chunks...`, 'AttemptsSeeder');

  const CHUNK = 5000;
  for (let i = 0; i < attemptsData.length; i += CHUNK) {
    await dataSource
      .createQueryBuilder()
      .insert()
      .into(QuizAttempt)
      .values(attemptsData.slice(i, i + CHUNK) as QuizAttempt[])
      .execute();
  }

  logger.log(`✅ ${attemptsData.length} attempts created`, 'AttemptsSeeder');
}
