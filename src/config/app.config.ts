import { ConfigService } from '@nestjs/config';

export interface AppConfig {
  port: number;
  host: string;
  globalPrefix: string;
  environment: string;
}

export function getAppConfig(configService: ConfigService): AppConfig {
  return {
    port: configService.get<number>('PORT', 5000),
    host: configService.get<string>('APP_HOST', '0.0.0.0'),
    globalPrefix: configService.get<string>('GLOBAL_PREFIX', 'api'),
    environment: configService.get<string>('NODE_ENV', 'development'),
  };
}
