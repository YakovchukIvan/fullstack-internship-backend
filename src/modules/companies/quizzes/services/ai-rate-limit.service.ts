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

  async checkAndIncrement(companyId: string): Promise<{ remaining: number }> {
    const key = this.getCacheKey(companyId);
    const currentCount = await this.getCurrentCount(companyId);

    if (currentCount >= this.dailyLimit) {
      throw new HttpException(
        'Daily AI quiz generation limit reached. Try again tomorrow.',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    await this.cacheManager.set(key, currentCount + 1, this.getMsUntilMidnight());

    return { remaining: this.dailyLimit - (currentCount + 1) };
  }

  async getRemainingQuota(companyId: string): Promise<{ remaining: number; limit: number; resetsAt: Date }> {
    const currentCount = await this.getCurrentCount(companyId);
    const resetsAt = new Date();
    resetsAt.setDate(resetsAt.getDate() + 1);
    resetsAt.setHours(0, 0, 0, 0);

    return {
      remaining: Math.max(0, this.dailyLimit - currentCount),
      limit: this.dailyLimit,
      resetsAt,
    };
  }

  private async getCurrentCount(companyId: string): Promise<number> {
    const count = await this.cacheManager.get<number>(this.getCacheKey(companyId));
    return count ?? 0;
  }

  private getMsUntilMidnight(): number {
    const midnight = new Date();
    midnight.setDate(midnight.getDate() + 1);
    midnight.setHours(0, 0, 0, 0);
    return midnight.getTime() - Date.now();
  }

  private getCacheKey(companyId: string): string {
    return `ai_quiz:${companyId}`;
  }
}
