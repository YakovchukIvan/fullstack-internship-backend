import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Quiz } from './entities/quiz.entity';
import { QuizAttempt } from './entities/quiz-attempt.entity';
import { QuizRepository } from './repositories/quiz.repository';
import { QuizAttemptRepository } from './repositories/quiz-attempt.repository';
import { QuizzesService } from './services/quizzes.service';
import { AiQuizGeneratorService } from './services/ai-quiz-generator.service';
import { AiRateLimitService } from './services/ai-rate-limit.service';
import { QuizAttemptsService } from './services/quiz-attempts.service';
import { QuizzesController } from './controllers/quizzes.controller';
import { QuizzesAiController } from './controllers/quizzes-ai.controller';
import { QuizAttemptsController } from './controllers/quiz-attempts.controller';
import { CompaniesService } from '../services/companies.service';
import { CompanyMembersService } from '../services/company-members.service';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyMemberRepository } from '../repositories/company-member.repository';
import { AppLogger } from '@/common/logger/app-logger';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, QuizAttempt]), CacheModule.register()],
  controllers: [QuizzesController, QuizzesAiController, QuizAttemptsController],
  providers: [
    QuizRepository,
    QuizAttemptRepository,
    CompanyRepository,
    CompanyMemberRepository,
    QuizzesService,
    QuizAttemptsService,
    AiQuizGeneratorService,
    AiRateLimitService,
    CompaniesService,
    CompanyMembersService,
    AppLogger,
  ],
  exports: [QuizRepository, QuizAttemptRepository, QuizzesService, QuizAttemptsService],
})
export class QuizzesModule {}
