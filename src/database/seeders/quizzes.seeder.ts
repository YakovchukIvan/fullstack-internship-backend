import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { User } from '@/modules/users/entities/user.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { Quiz } from '@/modules/companies/quizzes/entities/quiz.entity';
import { QuizQuestion } from '@/modules/companies/quizzes/shared/interfaces/quiz.interfaces';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { AppLogger } from '@/common/logger/app-logger';

function generateQuestions(): QuizQuestion[] {
  const count = faker.number.int({ min: 3, max: 8 });

  return Array.from({ length: count }, () => {
    const optionCount = faker.number.int({ min: 2, max: 4 });
    const options = Array.from({ length: optionCount }, () => faker.lorem.words({ min: 1, max: 3 }));
    const correctAnswers = [faker.number.int({ min: 0, max: options.length - 1 })];

    return {
      question: faker.lorem.sentence() + '?',
      options,
      correctAnswers,
    } satisfies QuizQuestion;
  });
}

export async function seedQuizzes(
  dataSource: DataSource,
  users: User[],
  companies: Company[],
  companyMembersMap: Map<string, string[]>,
  logger: AppLogger,
): Promise<Quiz[]> {
  logger.log('📝 Creating 20 quizzes per company...', 'QuizzesSeeder');

  const allQuizzes: Quiz[] = [];

  for (const company of companies) {
    const memberIds = companyMembersMap.get(company.id) ?? [];
    const creatorId = memberIds[0];

    if (!creatorId) {
      logger.log(`⚠️ No members for company ${company.id}, skipping`, 'QuizzesSeeder');
      continue;
    }

    const creator = users.find((u) => u.id === creatorId);

    const quizzesData = Array.from({ length: 20 }, () => ({
      title: faker.lorem.sentence({ min: 3, max: 6 }),
      description: faker.datatype.boolean() ? faker.lorem.paragraph() : null,
      frequencyInDays: faker.helpers.arrayElement([1, 3, 7, 14]),
      timeLimitMinutes: faker.helpers.arrayElement([20, 30, 60, 120]),
      questions: generateQuestions(),
      companyId: company.id,
      createdByUserId: creatorId,
      createdBySnapshot: {
        displayName: creator ? `${creator.firstName} ${creator.lastName}`.trim() : 'Unknown',
        role: CompanyRole.OWNER,
      },
      isAiGenerated: false,
      aiPrompt: null,
      aiMetadata: null,
    }));

    const inserted = await dataSource
      .createQueryBuilder()
      .insert()
      .into(Quiz)
      .values(quizzesData)
      .returning('*')
      .execute();

    allQuizzes.push(...(inserted.generatedMaps as Quiz[]));
  }

  logger.log(`✅ ${allQuizzes.length} quizzes created`, 'QuizzesSeeder');
  return allQuizzes;
}
