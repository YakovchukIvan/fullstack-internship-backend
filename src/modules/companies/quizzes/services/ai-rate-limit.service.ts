import { Injectable, Inject, HttpException, HttpStatus } from '@nestjs/common';
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
    const currentCount: number = await this.getCurrentCount(companyId);

    const now = new Date();
    const resetsAt = new Date(now);
    resetsAt.setDate(resetsAt.getDate() + 1);
    resetsAt.setHours(0, 0, 0, 0);

    const allowed: boolean = currentCount < this.dailyLimit;
    const remaining: number = Math.max(0, this.dailyLimit - currentCount);

    return { allowed, remaining, resetsAt };
  }

  async checkAndIncrement(companyId: string): Promise<{ remaining: number }> {
    const key = this.getCacheKey(companyId);
    const currentCount: number = await this.getCurrentCount(companyId);

    if (currentCount >= this.dailyLimit) {
      throw new HttpException(
        'Daily AI quiz generation limit reached. Try again tomorrow.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const ttl: number = this.getMsUntilMidnight();
    await this.cacheManager.set(key, currentCount + 1, ttl);

    const remaining: number = this.dailyLimit - (currentCount + 1);

    return { remaining };
  }

  async getRemainingQuota(companyId: string): Promise<{ remaining: number; limit: number; resetsAt: Date }> {
    const { remaining, resetsAt } = await this.checkLimit(companyId);

    return {
      remaining,
      limit: this.dailyLimit,
      resetsAt,
    };
  }

  private async getCurrentCount(companyId: string): Promise<number> {
    const key = this.getCacheKey(companyId);
    const count = await this.cacheManager.get<number>(key);

    return count ?? 0;
  }

  private getMsUntilMidnight(): number {
    const now = new Date();
    const midnight = new Date(now);
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);

    return midnight.getTime() - now.getTime();
  }

  private getCacheKey(companyId: string): string {
    return `ai_quiz:${companyId}`;
  }
}
