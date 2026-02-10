import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getCorsConfig } from './config/cors.config';
import { AppLogger } from './common/logger/app-logger';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { globalValidationPipe } from './common/pipes/global-validation.pipe';
import { getAppConfig } from './config/app.config';
import { setupSwagger } from './config/swagger.config';
import cookieParser from 'cookie-parser';
import { ResponseInterceptor } from './common/interceptors/response.interceptor';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  const logger = app.get(AppLogger);
  logger.setLoggerContext('MAIN');

  const configService = app.get(ConfigService);
  const config = getAppConfig(configService);

  app.useLogger(logger);
  app.use(cookieParser());
  app.enableCors(getCorsConfig(configService));
  app.useGlobalInterceptors(new ResponseInterceptor(app.get(Reflector)));
  app.setGlobalPrefix(config.globalPrefix);
  app.useGlobalPipes(globalValidationPipe);
  app.useGlobalFilters(new AllExceptionsFilter(logger));

  setupSwagger(app, config.globalPrefix, configService);

  await logger.measure('✅ HTTP server listen', () => app.listen(config.port, config.host));
  logger.log(`✅ http://${config.host}:${config.port}`);
}

bootstrap().catch((err: unknown) => {
  const logger = new AppLogger('MAIN');
  logger.logError('❌ Application failed to start', err);
  process.exit(1);
});
