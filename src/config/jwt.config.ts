import { ConfigService } from '@nestjs/config';
import { JwtModuleOptions, JwtSignOptions } from '@nestjs/jwt';

export const getJwtConfig = (configService: ConfigService): JwtModuleOptions => ({
  secret: configService.getOrThrow<string>('JWT_SECRET'),
  signOptions: {
    expiresIn: configService.getOrThrow('JWT_EXPIRES_IN') as JwtSignOptions['expiresIn'],
    issuer: 'your-app-name',
    audience: 'your-app-users',
  },
});
