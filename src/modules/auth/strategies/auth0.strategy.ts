import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { Auth0Payload } from '../interfaces/jwt-payload.interface';
import { AuthOAuthService } from '../services/auth-oauth.service';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(
    configService: ConfigService,
    private readonly authOAuthService: AuthOAuthService,
  ) {
    const domain = configService.getOrThrow<string>('AUTH0_DOMAIN');
    const audience = configService.getOrThrow<string>('AUTH0_AUDIENCE');

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      audience,
      issuer: `https://${domain}/`,
      algorithms: ['RS256'],
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${domain}/.well-known/jwks.json`,
      }),
    });
  }

  async validate(payload: Auth0Payload): Promise<Auth0Payload> {
    if (!payload.email) {
      throw new UnauthorizedException('Email not found in Auth0 token');
    }

    const user = await this.authOAuthService.validateAuth0User(payload);

    return {
      sub: user.id,
      email: user.email,
      role: user.role,
      iss: payload.iss,
      aud: payload.aud,
    };
  }
}
