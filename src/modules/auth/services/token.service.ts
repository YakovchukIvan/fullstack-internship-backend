import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { User } from '@/modules/users/entities/user.entity';
import { Response } from 'express';
import { randomUUID } from 'crypto';
import { AccessTokenPayload, RefreshTokenPayload } from '../interfaces/token-payload.interface';
import { parseJwtExpiry } from '../helpers/jwt-expiry.helper';

@Injectable()
export class TokenService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  generateAccessToken(user: User): { token: string; jti: string } {
    const jti = randomUUID();
    const payload: AccessTokenPayload = { sub: user.id, email: user.email, role: user.role, jti };

    const token = this.jwtService.sign(payload);
    return { token, jti };
  }

  generateRefreshToken(user: User): { token: string; jti: string } {
    const jti = randomUUID();
    const payload: RefreshTokenPayload = {
      sub: user.id,
      jti,
    };

    const expiresIn = this.configService.getOrThrow('JWT_REFRESH_EXPIRES_IN') as JwtSignOptions['expiresIn'];

    const token = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn,
    });

    return { token, jti };
  }

  async verifyRefreshToken(token: string): Promise<RefreshTokenPayload> {
    return this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
      secret: this.configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
    });
  }

  getTokenExpirationTime(): number {
    const expiresIn = this.configService.get<string>('JWT_EXPIRES_IN', '1h');
    return parseJwtExpiry(expiresIn);
  }

  decodeRefreshToken(token: string): RefreshTokenPayload | null {
    return this.jwtService.decode<RefreshTokenPayload>(token);
  }

  setAuthCookies(response: Response, accessToken: string, refreshToken: string): void {
    const isProduction = this.configService.get<string>('NODE_ENV') === 'production';

    response.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: this.getTokenExpirationTime() * 1000,
    });

    response.cookie('refresh_token', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }

  clearAuthCookies(response: Response): void {
    response.clearCookie('access_token');
    response.clearCookie('refresh_token');
  }
}
