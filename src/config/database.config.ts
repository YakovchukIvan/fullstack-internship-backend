import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions, TypeOrmModuleOptions } from '@nestjs/typeorm';

const createTypeOrmOptions = (config: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  database: config.getOrThrow<string>('POSTGRES_DB'),
  username: config.getOrThrow<string>('POSTGRES_USER'),
  password: config.getOrThrow<string>('POSTGRES_PASSWORD'),
  host: config.getOrThrow<string>('POSTGRES_HOST'),
  port: Number(config.getOrThrow<string>('POSTGRES_PORT')),

  autoLoadEntities: true,
  synchronize: false,
  logging: config.get('NODE_ENV') === 'development',
  migrationsRun: true,
  migrations: ['dist/database/migrations/**/*{.ts,.js}'],
});

export const databaseConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (config: ConfigService) => createTypeOrmOptions(config),
};
