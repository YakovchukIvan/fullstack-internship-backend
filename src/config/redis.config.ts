import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (configService: ConfigService) => ({
  host: configService.get<string>('REDIS_HOST', 'localhost'),
  port: Number(configService.get<string>('REDIS_PORT', '6379')),
  password: configService.get<string>('REDIS_PASSWORD'),
  url: configService.get<string>('REDIS_URL'),
});
