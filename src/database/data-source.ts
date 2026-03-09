import { DataSource, DataSourceOptions } from 'typeorm';
import { config } from 'dotenv';
import { AppLogger } from '@/common/logger/app-logger';

const nodeEnv = process.env.NODE_ENV || 'development';
const envFile = `.env.${nodeEnv}`;

config({ path: envFile });

const logger = new AppLogger('DataSource');

logger.log(`NODE_ENV = ${nodeEnv}`);
logger.log(`env file = ${envFile}`);
logger.log(`POSTGRES_HOST = ${process.env.POSTGRES_HOST}`);
logger.log(`POSTGRES_DB = ${process.env.POSTGRES_DB}`);

export const dataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: process.env.POSTGRES_HOST,
  port: Number(process.env.POSTGRES_PORT),
  username: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DB,
  entities: ['src/**/*.entity{.ts,.js}'],
  migrations: ['src/database/migrations/**/*{.ts,.js}'],
  synchronize: false,
  logging: process.env.NODE_ENV === 'development',
  migrationsRun: false,
  migrationsTableName: 'migrations',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

const dataSource = new DataSource(dataSourceOptions);

export default dataSource;
