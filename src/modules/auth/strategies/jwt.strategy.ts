import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { TokenRedisRepository } from '../repositories/token-redis.repository';
import { Request } from 'express';
import { AccessTokenPayload } from '../interfaces/token-payload.interface';

interface JwtCookies {
  access_token?: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    configService: ConfigService,
    private readonly tokenRedisRepository: TokenRedisRepository,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => (request.cookies as JwtCookies).access_token ?? null,
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('JWT_SECRET'),
    });
  }

  async validate(payload: AccessTokenPayload): Promise<AccessTokenPayload> {
    const isValid = await this.tokenRedisRepository.isAccessTokenValid(payload.sub, payload.jti);

    if (!isValid) {
      throw new UnauthorizedException('Token has been revoked');
    }

    return {
      sub: payload.sub,
      email: payload.email,
      role: payload.role,
      jti: payload.jti,
    };
  }
}
