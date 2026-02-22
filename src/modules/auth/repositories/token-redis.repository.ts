import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '@/modules/redis/redis.service';
import { RedisKeys } from '@/modules/redis/redis.constants';
import { parseJwtExpiry } from '../helpers/jwt-expiry.helper';

@Injectable()
export class TokenRedisRepository {
  private readonly accessTokenTtl: number;
  private readonly refreshTokenTtl: number;

  constructor(
    private readonly redisService: RedisService,
    private readonly configService: ConfigService,
  ) {
    this.accessTokenTtl = parseJwtExpiry(this.configService.getOrThrow<string>('JWT_EXPIRES_IN'));
    this.refreshTokenTtl = parseJwtExpiry(this.configService.getOrThrow<string>('JWT_REFRESH_EXPIRES_IN'));
  }

  async saveAccessToken(userId: string, jti: string): Promise<void> {
    const key = RedisKeys.accessToken(userId, jti);
    await this.redisService.set(key, '1', this.accessTokenTtl);
  }

  async saveRefreshToken(userId: string, jti: string): Promise<void> {
    const key = RedisKeys.refreshToken(userId, jti);
    await this.redisService.set(key, '1', this.refreshTokenTtl);
  }

  async isAccessTokenValid(userId: string, jti: string): Promise<boolean> {
    const key = RedisKeys.accessToken(userId, jti);
    return this.redisService.exists(key);
  }

  async isRefreshTokenValid(userId: string, jti: string): Promise<boolean> {
    const key = RedisKeys.refreshToken(userId, jti);
    return this.redisService.exists(key);
  }

  async revokeAccessToken(userId: string, jti: string): Promise<void> {
    const key = RedisKeys.accessToken(userId, jti);
    await this.redisService.del(key);
  }

  async revokeRefreshToken(userId: string, jti: string): Promise<void> {
    const key = RedisKeys.refreshToken(userId, jti);
    await this.redisService.del(key);
  }

  async revokeAllUserTokens(userId: string): Promise<void> {
    await this.redisService.delByPattern(RedisKeys.allUserAccessTokens(userId));
    await this.redisService.delByPattern(RedisKeys.allUserRefreshTokens(userId));
  }
}
