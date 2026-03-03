import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { User } from '@/modules/users/entities/user.entity';
import { Auth } from '@/modules/auth/entities/auth.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { AppLogger } from '@/common/logger/app-logger';

const USERS_CREATED_AT = new Date('2025-01-01T00:00:00.000Z');

export async function seedUsers(dataSource: DataSource, logger: AppLogger): Promise<User[]> {
  logger.log('👤 Creating 100 users...', 'UsersSeeder');

  const passwordHash = await bcrypt.hash('string123', 10);

  const usersData: Partial<User>[] = Array.from({ length: 100 }, () => ({
    email: faker.internet.email().toLowerCase(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    avatarUrl: faker.image.avatar(),
    role: UserRole.USER,
    createdAt: USERS_CREATED_AT,
    updatedAt: USERS_CREATED_AT,
  }));

  const inserted = await dataSource.createQueryBuilder().insert().into(User).values(usersData).returning('*').execute();

  const users = inserted.generatedMaps as User[];

  const authRepo = dataSource.getRepository(Auth);
  await authRepo.save(
    users.map((u) =>
      authRepo.create({
        userId: u.id,
        passwordHash,
        googleId: null,
        createdAt: USERS_CREATED_AT,
        updatedAt: USERS_CREATED_AT,
      }),
    ),
  );

  logger.log(`✅ ${users.length} users created`, 'UsersSeeder');
  return users;
}
