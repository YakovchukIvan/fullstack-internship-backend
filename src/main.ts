import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getCorsConfig } from './config/cors.config';
import { AppLogger } from './common/logger/app-logger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap(): Promise<void> {
  const logger = new AppLogger('Bootstrap');

  const app = await NestFactory.create(AppModule, {
    logger,
  });
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = Number(configService.get('PORT', 5000));
  const host = configService.get<string>('APP_HOST', '0.0.0.0');

  app.enableCors(getCorsConfig(configService));

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  const appLogger = app.get(AppLogger);
  app.useGlobalFilters(new AllExceptionsFilter(appLogger));

  await logger.measure('✅ [LOGGER] HTTP server listen', () => app.listen(port, host));

  logger.log(`✅ [LOGGER] http://${host}:${port}`);
}

bootstrap().catch((err: unknown) => {
  const logger = new AppLogger('Bootstrap');
  logger.logError('❌ [LOGGER] Application failed to start', err);
  process.exit(1);
});
