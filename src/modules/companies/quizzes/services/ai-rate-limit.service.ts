import { Injectable, Inject } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { ConfigService } from '@nestjs/config';
import { getGeminiConfig } from '@/config/gemini.config';

@Injectable()
export class AiRateLimitService {
  private readonly dailyLimit: number;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
  ) {
    const config = getGeminiConfig(this.configService);
    this.dailyLimit = config.dailyLimit;
  }

  async checkLimit(companyId: string): Promise<{ allowed: boolean; remaining: number; resetsAt: Date }> {
    const key = this.getCacheKey(companyId);
    const count = await this.cacheManager.get<number>(key);
    const currentCount = count ?? 0;

    const now = new Date();
    const resetsAt = new Date(now);
    resetsAt.setDate(resetsAt.getDate() + 1);
    resetsAt.setHours(0, 0, 0, 0);

    return {
      allowed: currentCount < this.dailyLimit,
      remaining: Math.max(0, this.dailyLimit - currentCount),
      resetsAt,
    };
  }

  async incrementUsage(companyId: string): Promise<void> {
    const key = this.getCacheKey(companyId);
    const count = await this.cacheManager.get<number>(key);
    const currentCount = count ?? 0;

    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    const ttl = Math.floor((midnight.getTime() - now.getTime()) / 1000);

    await this.cacheManager.set(key, currentCount + 1, ttl * 1000);
  }

  async getRemainingQuota(companyId: string): Promise<{ remaining: number; limit: number; resetsAt: Date }> {
    const { remaining, resetsAt } = await this.checkLimit(companyId);
    return {
      remaining,
      limit: this.dailyLimit,
      resetsAt,
    };
  }

  private getCacheKey(companyId: string): string {
    return `ai_quiz:${companyId}`;
  }
}
