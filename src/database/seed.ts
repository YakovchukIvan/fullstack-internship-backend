import { DataSource } from 'typeorm';
import { AppLogger } from '@/common/logger/app-logger';
import { seedCompanies } from './seeders/companies.seeder';
import { seedInvitations } from './seeders/invitations-and-join-requests.seeder';
import { seedQuizzes } from './seeders/quizzes.seeder';
import { seedAttempts } from './seeders/attempts.seeder';
import { seedUsers } from './seeders/sers.seeder';

export async function seedDatabase(dataSource: DataSource, logger: AppLogger): Promise<void> {
  const context = 'DatabaseSeeder';
  logger.setLoggerContext(context);
  logger.log('🌱 Starting seed...', context);

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.connect();
  await queryRunner.startTransaction();

  try {
    const users = await seedUsers(dataSource, logger);
    const { companies, allMembers, companyMembersMap } = await seedCompanies(dataSource, users, logger);
    await seedInvitations(dataSource, users, companies, allMembers, companyMembersMap, logger);
    const quizzes = await seedQuizzes(dataSource, users, companies, companyMembersMap, logger);
    await seedAttempts(dataSource, users, companies, quizzes, companyMembersMap, logger);

    await queryRunner.commitTransaction();
    logger.log('🚀 Seed completed successfully!', context);
  } catch (error) {
    await queryRunner.rollbackTransaction();
    const msg = error instanceof Error ? error.message : 'Unknown error';
    logger.logError(`Seed failed: ${msg}`, error, context);
    throw error;
  } finally {
    await queryRunner.release();
  }
}
