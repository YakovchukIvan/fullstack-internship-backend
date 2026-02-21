import { ConfigService } from '@nestjs/config';

export const getRedisConfig = (configService: ConfigService) => ({
  host: configService.getOrThrow<string>('REDIS_HOST'),
  port: Number(configService.getOrThrow<string>('REDIS_PORT')),
  password: configService.get<string>('REDIS_PASSWORD'),
});
