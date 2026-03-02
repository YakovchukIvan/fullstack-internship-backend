import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import { subDays, addMinutes } from 'date-fns';
import * as bcrypt from 'bcrypt';

import { User } from '@/modules/users/entities/user.entity';
import { Auth } from '@/modules/auth/entities/auth.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { CompanyMember } from '@/modules/companies/entities/company-member.entity';

import { UserRole } from '@/common/enums/user-role.enum';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { AppLogger } from '@/common/logger/app-logger';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import { Quiz } from '@/modules/companies/quizzes/entities/quiz.entity';

export async function seedDatabase(dataSource: DataSource, logger: AppLogger) {
  const context = 'DatabaseSeeder';
  logger.setLoggerContext(context);
  logger.log('🌱 Starting data generation process...', context);

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const defaultPassword = await bcrypt.hash('password123', 10);

    // 1. CREATION OF USERS AND AUTH (100 users)
    logger.log('👤 Creating 100 users...', context);
    const usersData: Partial<User>[] = [];

    for (let i = 0; i < 100; i++) {
      usersData.push({
        email: faker.internet.email().toLowerCase(),
        firstName: faker.person.firstName(),
        lastName: faker.person.lastName(),
        avatarUrl: faker.image.avatar(),
        role: UserRole.USER,
      });
    }

    const insertedUsers = await dataSource
      .createQueryBuilder()
      .insert()
      .into(User)
      .values(usersData)
      .returning('*')
      .execute();

    const users = insertedUsers.generatedMaps as User[];

    const authData = users.map((user) => ({
      userId: user.id,
      passwordHash: defaultPassword,
    }));

    await dataSource.createQueryBuilder().insert().into(Auth).values(authData).execute();
    logger.log(`✅ Successfully created ${users.length} users.`, context);

    // 2. CREATION OF COMPANIES AND MEMBERS
    logger.log('🏢 Creating 10 companies and assigning roles...', context);

    const crossoverUsers = users.slice(0, 3);
    const availableUsers = users.slice(3);

    const companies: Company[] = [];
    const membersData: Partial<CompanyMember>[] = [];

    for (let i = 0; i < 10; i++) {
      const owner = availableUsers.pop()!;
      const admin = availableUsers.pop()!;

      const companyInsert = await dataSource
        .createQueryBuilder()
        .insert()
        .into(Company)
        .values({
          name: faker.company.name(),
          slug: faker.lorem.slug() + `-${i}`,
          description: faker.company.catchPhrase(),
          avatarUrl: faker.image.urlPicsumPhotos({ width: 200, height: 200 }),
          isVisible: true,
          ownerId: owner.id,
          membersCount: 10,
        })
        .returning('*')
        .execute();

      const company = companyInsert.generatedMaps[0] as Company;
      companies.push(company);

      membersData.push({ userId: owner.id, companyId: company.id, role: CompanyRole.OWNER });
      membersData.push({ userId: admin.id, companyId: company.id, role: CompanyRole.ADMIN });

      const numCrossover = faker.number.int({ min: 1, max: 2 });
      const currentCrossovers = faker.helpers.arrayElements(crossoverUsers, numCrossover);
      currentCrossovers.forEach((cu) => {
        membersData.push({ userId: cu.id, companyId: company.id, role: CompanyRole.MEMBER });
      });

      const membersNeeded = 10 - 2 - currentCrossovers.length;
      for (let j = 0; j < membersNeeded; j++) {
        if (availableUsers.length > 0) {
          const regularUser = availableUsers.pop()!;
          membersData.push({ userId: regularUser.id, companyId: company.id, role: CompanyRole.MEMBER });
        }
      }
    }

    await dataSource.createQueryBuilder().insert().into(CompanyMember).values(membersData).execute();
    logger.log(`✅ Created ${companies.length} companies and ${membersData.length} member relations.`, context);

    // 3. CREATING QUIZZES (20 per company)
    logger.log('📝 Creating quizzes (20 per company)...', context);
    const quizzes: Quiz[] = [];

    const quizTemplates = Array.from({ length: 20 }).map(() => ({
      title: faker.lorem.sentence({ min: 3, max: 6 }),
      description: faker.lorem.paragraph(),
      frequencyInDays: faker.helpers.arrayElement([1, 3, 7]),
      questions: [{ id: faker.string.uuid(), text: 'Sample Question?', options: ['A', 'B'], correctIndex: 0 }],
      isAiGenerated: faker.datatype.boolean(),
    }));

    for (const company of companies) {
      const companyQuizzesData = quizTemplates.map((qt) => ({
        ...qt,
        companyId: company.id,
        createdByUserId: company.ownerId,
        createdBySnapshot: { name: 'Owner', role: CompanyRole.OWNER },
      }));

      const insertedQuizzes = await dataSource
        .createQueryBuilder()
        .insert()
        .into(Quiz)
        .values(companyQuizzesData)
        .returning('*')
        .execute();
      quizzes.push(...(insertedQuizzes.generatedMaps as Quiz[]));
    }
    logger.log(`✅ Successfully created ${quizzes.length} quizzes in total.`, context);

    // 4. GENERATION OF QUIZ ATTEMPTS
    logger.log('🎯 Generating quiz attempt history (60-day simulation)...', context);
    const attemptsData: Partial<QuizAttempt>[] = [];
    const DAYS_TO_SIMULATE = 60;
    const TODAY = new Date();

    for (const company of companies) {
      const companyQuizzes = quizzes.filter((q) => q.companyId === company.id);
      const companyUsers = membersData.filter((m) => m.companyId === company.id).map((m) => m.userId);

      for (const userId of companyUsers) {
        const userType = faker.helpers.arrayElement(['hardworker', 'average', 'lazy']);

        for (let day = DAYS_TO_SIMULATE; day >= 0; day--) {
          const currentDate = subDays(TODAY, day);

          let willTakeQuizToday = false;
          if (userType === 'hardworker') {
            willTakeQuizToday = faker.datatype.boolean({ probability: 0.9 });
          }
          if (userType === 'average') {
            willTakeQuizToday = faker.datatype.boolean({ probability: 0.5 });
          }
          if (userType === 'lazy') {
            willTakeQuizToday = faker.datatype.boolean({ probability: 0.1 });
          }

          if (willTakeQuizToday) {
            const quizzesToTakeToday = faker.helpers.arrayElements(companyQuizzes, 5);

            for (const quiz of quizzesToTakeToday) {
              const score =
                userType === 'hardworker'
                  ? faker.number.int({ min: 80, max: 100 })
                  : faker.number.int({ min: 20, max: 90 });

              attemptsData.push({
                userId,
                quizId: quiz.id,
                companyId: company.id,
                totalPoints: score,
                maxPossiblePoints: 100,
                durationSeconds: faker.number.int({ min: 30, max: 300 }),
                completedAt: addMinutes(currentDate, faker.number.int({ min: 1, max: 600 })),
              });
            }
          }
        }
      }
    }

    logger.log(`⏳ Зберігаємо ${attemptsData.length} спроб проходження чанками...`, context);
    const chunkSize = 5000;
    for (let i = 0; i < attemptsData.length; i += chunkSize) {
      const chunk = attemptsData.slice(i, i + chunkSize);
      await dataSource.createQueryBuilder().insert().into(QuizAttempt).values(chunk).execute();
    }

    await queryRunner.commitTransaction();
    logger.log('🚀 База успішно заповнена тестовими даними!', context);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    logger.logError(`Помилка під час сідінгу: ${errorMessage}`, error, context);
    await queryRunner.rollbackTransaction();
    throw error;
  } finally {
    await queryRunner.release();
  }
}
