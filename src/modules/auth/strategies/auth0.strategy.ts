import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { User } from '@/modules/users/entities/user.entity';
import { AuthService } from '../services/auth.service';
import { Auth0Payload } from '../interfaces/jwt-payload.interface';

@Injectable()
export class Auth0Strategy extends PassportStrategy(Strategy, 'auth0') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
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

  async validate(payload: Auth0Payload): Promise<User> {
    if (!payload.email) {
      throw new UnauthorizedException('Email not found in Auth0 token');
    }

    const user = await this.authService.validateAuth0User(payload);

    return user;
  }
}
