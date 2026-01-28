import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

export const getDatabaseConfig = (configService: ConfigService): TypeOrmModuleOptions => ({
  type: 'postgres',
  database: configService.getOrThrow<string>('POSTGRES_DB'),
  username: configService.getOrThrow<string>('POSTGRES_USER'),
  password: configService.getOrThrow<string>('POSTGRES_PASSWORD'),
  host: configService.getOrThrow<string>('POSTGRES_HOST'),
  port: configService.getOrThrow<number>('POSTGRES_PORT'),
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
});
