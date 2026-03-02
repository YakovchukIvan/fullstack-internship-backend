import { NestFactory } from '@nestjs/core';
import { AppModule } from '@/app.module';
import { AppLogger } from '@/common/logger/app-logger';
import { DataSource } from 'typeorm';
import { seedDatabase } from './seed';

async function run() {
  // Створюємо контекст додатка без запуску HTTP сервера
  const app = await NestFactory.createApplicationContext(AppModule);

  const logger = app.get(AppLogger);
  logger.setLoggerContext('RUN SEED');
  const dataSource = app.get(DataSource);

  try {
    await seedDatabase(dataSource, logger);
  } catch (error) {
    // Використовуємо твій логер для виводу помилки
    logger.logError('❌ Seed process failed', error, 'SeedRunner');
    process.exit(1);
  } finally {
    await app.close();
    process.exit(0);
  }
}

run().catch((err) => {
  const logger = new AppLogger('RUN SEED');
  logger.logError('Fatal error during seed execution:', err);
  process.exit(1);
});
