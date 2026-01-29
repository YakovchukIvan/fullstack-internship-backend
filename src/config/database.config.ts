import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

/**
 * Конфігурація TypeORM для NestJS додатку
 * Використовується в AppModule
 */
export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',

  // Отримуємо дані підключення з ConfigService
  database: configService.getOrThrow<string>('POSTGRES_DB'),
  username: configService.getOrThrow<string>('POSTGRES_USER'),
  password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
  host: configService.getOrThrow<string>('POSTGRES_HOST'),
  port: Number(configService.getOrThrow<string>('POSTGRES_PORT')),

  /**
   * Шляхи до entities
   * Автоматично знаходить всі файли *.entity.ts|js
   */
  entities: [__dirname + '/../modules/**/entities/*.entity{.ts,.js}'],

  /**
   * ВАЖЛИВО: synchronize тепер false!
   * Тепер ми використовуємо міграції замість auto-sync
   * auto-sync небезпечний для продакшну
   */
  synchronize: false,

  /**
   * Вмикаємо логування тільки в development режимі
   */
  logging: process.env.NODE_ENV === 'development',

  /**
   * Автоматично запускати міграції при старті додатку
   * Для продакшну краще вимкнути і запускати міграції окремо
   */
  migrationsRun: true,

  /**
   * Шляхи до міграцій для запуску в додатку
   */
  migrations: ['dist/database/migrations/**/*{.ts,.js}'],
});
