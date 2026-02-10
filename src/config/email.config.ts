import { ConfigService } from '@nestjs/config';

export interface EmailConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  fromEmail: string;
  fromName: string;
  frontendUrl: string;
}

export const getEmailConfig = (configService: ConfigService): EmailConfig => {
  const isDevelopment = configService.get<string>('NODE_ENV') !== 'production';

  return {
    host: configService.get<string>('EMAIL_HOST', 'smtp.gmail.com'),
    port: Number(configService.get<string>('EMAIL_PORT', '587')),
    user: configService.getOrThrow<string>('EMAIL_USER'),
    password: configService.getOrThrow<string>('EMAIL_PASSWORD'),
    fromEmail: configService.getOrThrow<string>('EMAIL_FROM'),
    fromName: configService.get<string>('EMAIL_FROM_NAME', 'Your App'),
    frontendUrl: isDevelopment
      ? configService.get<string>('FRONTEND_DEV_URL', 'http://localhost:3000')
      : configService.getOrThrow<string>('FRONTEND_PROD_URL'),
  };
};
