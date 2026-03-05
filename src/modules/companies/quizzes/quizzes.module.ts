import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizRepository } from './repositories/quiz.repository';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';
import { QuizAnswerRedisRepository } from './repositories/quiz-answer-redis.repository';
import { QuizAttemptsService } from './services/quiz-attempts.service';
import { CsvExportService } from './services/csv-export.service';
import { AppLogger } from '@/common/logger/app-logger';
import { QuizzesService } from './services//quizzes.service';
import { QuizExportService } from './services/quiz-export.service';
import { AiQuizGeneratorService } from './services//ai-quiz-generator.service';
import { AiRateLimitService } from './services/ai-rate-limit.service';
import { UsersModule } from '@/modules/users/users.module';
import { Module, forwardRef } from '@nestjs/common';
import { CompaniesModule } from '../companies.module';
import { QuizzesController } from './controllers/quizzes.controller';
import { QuizzesAiController } from './controllers/ai-quizzes.controller';
import { QuizSessionController } from './controllers/quiz-session.controller';
import { QuizAttemptsController } from './controllers/quiz-attempts.controller';
import { QuizExportController } from './controllers/quiz-export.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizAttempt]), forwardRef(() => CompaniesModule), UsersModule],
  controllers: [
    QuizzesController,
    QuizzesAiController,
    QuizSessionController,
    QuizAttemptsController,
    QuizExportController,
  ],
  providers: [
    QuizRepository,
    QuizAttemptRepository,
    QuizAnswerRedisRepository,
    QuizzesService,
    QuizAttemptsService,
    QuizExportService,
    CsvExportService,
    AiQuizGeneratorService,
    AiRateLimitService,
    AppLogger,
  ],
  exports: [
    QuizRepository,
    QuizAttemptRepository,
    QuizAnswerRedisRepository,
    QuizzesService,
    QuizAttemptsService,
    QuizExportService,
    CsvExportService,
  ],
})
export class QuizzesModule {}
