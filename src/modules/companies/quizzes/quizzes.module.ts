import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizRepository } from './repositories/quiz.repository';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';
import { QuizAnswerRedisRepository } from './repositories/quiz-answer-redis.repository';
import { QuizAttemptsService } from './attempts/quiz-attempts.service';
import { CsvExportService } from './export/csv-export.service';
import { QuizzesController } from './quiz/quizzes.controller';
import { QuizzesAiController } from './ai/quizzes-ai.controller';
import { CompaniesService } from '../services/companies.service';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyMemberRepository } from '../repositories/company-member.repository';
import { AppLogger } from '@/common/logger/app-logger';
import { QuizExportController } from './export/quiz-export.controller';
import { User } from '@/modules/users/entities/user.entity';
import { QuizzesService } from './quiz/quizzes.service';
import { QuizExportService } from './export/quiz-export.service';
import { QuizAttemptsController } from './attempts/quiz-attempts.controller';
import { AiQuizGeneratorService } from './ai/ai-quiz-generator.service';
import { AiRateLimitService } from './ai/ai-rate-limit.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizAttempt, User])],
  controllers: [QuizzesController, QuizzesAiController, QuizAttemptsController, QuizExportController],
  providers: [
    QuizRepository,
    QuizAttemptRepository,
    QuizAnswerRedisRepository,
    CompanyRepository,
    CompanyMemberRepository,
    QuizzesService,
    QuizAttemptsService,
    QuizExportService,
    CsvExportService,
    AiQuizGeneratorService,
    AiRateLimitService,
    CompaniesService,
    CompanyMembersService,
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
