import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';
import { ConfigService } from '@nestjs/config';

export const getCorsConfig = (configService: ConfigService): CorsOptions => {
  const devUrl = configService.getOrThrow<string>('FRONTEND_DEV_URL');
  const prodUrl = configService.getOrThrow<string>('FRONTEND_PROD_URL');

  return {
    origin: [devUrl, prodUrl],
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  };
};
