import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker';
import * as bcrypt from 'bcrypt';
import { User } from '@/modules/users/entities/user.entity';
import { Auth } from '@/modules/auth/entities/auth.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { AppLogger } from '@/common/logger/app-logger';

export async function seedUsers(dataSource: DataSource, logger: AppLogger): Promise<User[]> {
  logger.log('👤 Creating 100 users...', 'UsersSeeder');

  const passwordHash = await bcrypt.hash('string123', 10);

  const usersData: Partial<User>[] = Array.from({ length: 100 }, () => ({
    email: faker.internet.email().toLowerCase(),
    firstName: faker.person.firstName(),
    lastName: faker.person.lastName(),
    avatarUrl: faker.image.avatar(),
    role: UserRole.USER,
  }));

  const inserted = await dataSource.createQueryBuilder().insert().into(User).values(usersData).returning('*').execute();

  const users = inserted.generatedMaps as User[];

  await dataSource
    .createQueryBuilder()
    .insert()
    .into(Auth)
    .values(users.map((u) => ({ userId: u.id, passwordHash, googleId: null })))
    .execute();

  logger.log(`✅ ${users.length} users created`, 'UsersSeeder');
  return users;
}
