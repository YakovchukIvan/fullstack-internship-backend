import { ConfigService } from '@nestjs/config';

export const getAuth0Config = (configService: ConfigService) => ({
  domain: configService.getOrThrow<string>('AUTH0_DOMAIN'),
  audience: configService.getOrThrow<string>('AUTH0_AUDIENCE'),
  clientId: configService.getOrThrow<string>('AUTH0_CLIENT_ID'),
  clientSecret: configService.getOrThrow<string>('AUTH0_CLIENT_SECRET'),
  issuerUrl: configService.getOrThrow<string>('AUTH0_ISSUER_URL'),
});
