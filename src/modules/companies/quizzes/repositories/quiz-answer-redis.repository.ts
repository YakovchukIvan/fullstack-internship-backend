import { Injectable } from '@nestjs/common';
import { RedisService } from '@/modules/redis/redis.service';
import { RedisKeys, REDIS_TTL } from '@/modules/redis/redis.constants';
import { QuizAnswerSnapshot } from '../shared/interfaces/quiz-answer-snapshot.interface';

@Injectable()
export class QuizAnswerRedisRepository {
  constructor(private readonly redisService: RedisService) {}

  async saveAnswers(snapshot: QuizAnswerSnapshot): Promise<void> {
    const key = RedisKeys.quizAnswers(snapshot.userId, snapshot.quizId, snapshot.attemptId);
    await this.redisService.set(key, snapshot, REDIS_TTL.QUIZ_ANSWERS);
  }

  async getUserAnswersForQuiz(userId: string, quizId: string): Promise<QuizAnswerSnapshot[]> {
    const pattern = RedisKeys.allUserQuizAnswersForQuiz(userId, quizId);
    return this.scanAndParse(pattern);
  }

  async getCompanyAnswers(companyId: string, userId?: string): Promise<QuizAnswerSnapshot[]> {
    const pattern = userId ? RedisKeys.allUserQuizAnswers(userId) : RedisKeys.allQuizAnswers();

    const all = await this.scanAndParse(pattern);
    return all.filter((snapshot) => snapshot.companyId === companyId);
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
