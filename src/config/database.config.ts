import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  database: configService.getOrThrow<string>('POSTGRES_DB'),
  username: configService.getOrThrow<string>('POSTGRES_USER'),
  password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
  host: configService.getOrThrow<string>('POSTGRES_HOST'),
  port: Number(configService.getOrThrow<string>('POSTGRES_PORT')),

  autoLoadEntities: true,
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  migrationsRun: true,
  migrations: ['dist/database/migrations/**/*{.ts,.js}'],
});
