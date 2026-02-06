import { ConfigService } from '@nestjs/config';

export function getAppConfig(configService: ConfigService) {
  return {
    port: Number(configService.get('PORT', 5000)),
    host: configService.get<string>('APP_HOST', '0.0.0.0'),
    globalPrefix: configService.get<string>('GLOBAL_PREFIX', 'api'),
    environment: configService.get<string>('NODE_ENV', 'development'),
  };
}
