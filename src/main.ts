import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { getCorsConfig } from './config/cors.config';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  const port = Number(configService.get<string>('PORT')) || 5000;
  const host = configService.get<string>('APP_HOST') || 'localhost';

  app.enableCors(getCorsConfig(configService));

  await app.listen(port, host);
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});
