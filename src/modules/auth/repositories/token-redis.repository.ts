import { Injectable } from '@nestjs/common';
import { RedisService } from '@/modules/redis/redis.service';
import { RedisKeys, REDIS_TTL } from '@/modules/redis/redis.constants';

@Injectable()
export class TokenRedisRepository {
  constructor(private readonly redisService: RedisService) {}

  async saveAccessToken(userId: string, jti: string): Promise<void> {
    const key = RedisKeys.accessToken(userId, jti);
    await this.redisService.set(key, '1', REDIS_TTL.ACCESS_TOKEN);
  }

  async saveRefreshToken(userId: string, jti: string): Promise<void> {
    const key = RedisKeys.refreshToken(userId, jti);
    await this.redisService.set(key, '1', REDIS_TTL.REFRESH_TOKEN);
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
