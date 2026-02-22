import { Injectable } from '@nestjs/common';
import { RedisService } from '@/modules/redis/redis.service';
import { RedisKeys, REDIS_TTL } from '@/modules/redis/redis.constants';
import { QuizAnswerSnapshot } from '../interfaces/quiz-answer-snapshot.interface';

@Injectable()
export class QuizAnswerRedisRepository {
  constructor(private readonly redisService: RedisService) {}

  async saveAnswers(snapshot: QuizAnswerSnapshot): Promise<void> {
    const key = RedisKeys.quizAnswers(snapshot.userId, snapshot.attemptId);
    await this.redisService.set(key, snapshot, REDIS_TTL.QUIZ_ANSWERS);
  }

  async getUserAnswers(userId: string): Promise<QuizAnswerSnapshot[]> {
    const pattern = RedisKeys.allUserQuizAnswers(userId);
    return this.scanAndParse(pattern);
  }

  async getUserAnswersForQuiz(userId: string, quizId: string): Promise<QuizAnswerSnapshot[]> {
    const all = await this.getUserAnswers(userId);
    return all.filter((snapshot) => snapshot.quizId === quizId);
  }

  async getCompanyAnswers(companyId: string, userId?: string): Promise<QuizAnswerSnapshot[]> {
    const pattern = userId ? RedisKeys.allUserQuizAnswers(userId) : RedisKeys.allQuizAnswers();

    const all = await this.scanAndParse(pattern);
    return all.filter((snapshot) => snapshot.companyId === companyId);
  }

  async getAttemptAnswers(userId: string, attemptId: string): Promise<QuizAnswerSnapshot | null> {
    const key = RedisKeys.quizAnswers(userId, attemptId);
    return this.redisService.get<QuizAnswerSnapshot>(key);
  }

  private async scanAndParse(pattern: string): Promise<QuizAnswerSnapshot[]> {
    const keys = await this.redisService.scanKeys(pattern);
    if (keys.length === 0) {
      return [];
    }

    const snapshots = await Promise.all(keys.map((key) => this.redisService.get<QuizAnswerSnapshot>(key)));

    return snapshots.filter((s): s is QuizAnswerSnapshot => s !== null);
  }
}
