import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizRepository } from './repositories/quiz.repository';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';
import { QuizAnswerRedisRepository } from './repositories/quiz-answer-redis.repository';
import { QuizzesService } from './services/quizzes.service';
import { AiQuizGeneratorService } from './services/ai-quiz-generator.service';
import { AiRateLimitService } from './services/ai-rate-limit.service';
import { QuizAttemptsService } from './services/quiz-attempts.service';
import { QuizExportService } from './services/quiz-export.service';
import { CsvExportService } from './services/csv-export.service';
import { QuizzesController } from './controllers/quizzes.controller';
import { QuizzesAiController } from './controllers/quizzes-ai.controller';
import { QuizSessionController } from './controllers/quiz-session.controller';
import { QuizExportController } from './controllers/quiz-export.controller';
import { CompaniesService } from '../services/companies.service';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyMemberRepository } from '../repositories/company-member.repository';
import { AppLogger } from '@/common/logger/app-logger';
import { User } from '@/modules/users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizAttempt, User])],
  controllers: [QuizzesController, QuizzesAiController, QuizSessionController, QuizExportController],
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
