import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getCorsConfig } from './config/cors.config';
import { AppLogger } from './common/logger/app-logger';

async function bootstrap(): Promise<void> {
  const logger = new AppLogger('Bootstrap');

  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');

  const configService = app.get(ConfigService);
  const port = Number(configService.get('PORT', 5000));
  const host = configService.get<string>('APP_HOST', '0.0.0.0');

  app.enableCors(getCorsConfig(configService));

  await logger.measure('HTTP server listen', () => app.listen(port, host));

  logger.log(`✅ [LOGGER] http://${host}:${port}`);
}

bootstrap().catch((err: unknown) => {
  const logger = new AppLogger('Bootstrap');
  logger.errorUnknown('❌ [LOGGER] Application failed to start', err);
  process.exit(1);
});
