import { ConfigService } from '@nestjs/config';

export interface Auth0Config {
  domain: string;
  audience: string;
  clientId: string;
  clientSecret: string;
  issuerUrl: string;
}

export const getAuth0Config = (configService: ConfigService): Auth0Config => ({
  domain: configService.getOrThrow<string>('AUTH0_DOMAIN'),
  audience: configService.getOrThrow<string>('AUTH0_AUDIENCE'),
  clientId: configService.getOrThrow<string>('AUTH0_CLIENT_ID'),
  clientSecret: configService.getOrThrow<string>('AUTH0_CLIENT_SECRET'),
  issuerUrl: configService.getOrThrow<string>('AUTH0_ISSUER_URL'),
});
