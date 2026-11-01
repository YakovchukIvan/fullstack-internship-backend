import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getCorsConfig } from './config/cors.config';
import { AppLogger } from './common/logger/app-logger';
import { getAppConfig } from './config/app.config';
import { setupSwagger } from './config/swagger.config';
import cookieParser from 'cookie-parser';
import { json, urlencoded } from 'express';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, {
    bufferLogs: true,
    bodyParser: false,
  });

  const logger = app.get(AppLogger);
  logger.setLoggerContext('MAIN');
  app.useLogger(logger);

  const configService = app.get(ConfigService);
  const config = getAppConfig(configService);

  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());
  app.enableCors(getCorsConfig(configService));

  app.setGlobalPrefix(config.globalPrefix);

  setupSwagger(app, config.globalPrefix, configService);

  await logger.measure('✅ HTTP server listen', () => app.listen(config.port, config.host));
  logger.log(`✅ http://${config.host}:${config.port}`);
}

bootstrap().catch((err: unknown) => {
  const logger = new AppLogger('MAIN');
  logger.logError('❌ Application failed to start', err);
  process.exit(1);
});
