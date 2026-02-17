import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { Quiz } from './entities/quiz.entity';
import { QuizzesService } from './services/quizzes.service';
import { AiQuizGeneratorService } from './services/ai-quiz-generator.service';
import { AiRateLimitService } from './services/ai-rate-limit.service';
import { QuizzesController } from './controllers/quizzes.controller';
import { QuizzesAiController } from './controllers/quizzes-ai.controller';
import { CompaniesService } from '../services/companies.service';
import { Company } from '../entities/company.entity';
import { CompanyMember } from '../entities/company-member.entity';
import { AppLogger } from '@/common/logger/app-logger';
import { CompanyMembersService } from '../services/company-members.service';

@Module({
  imports: [TypeOrmModule.forFeature([Quiz, Company, CompanyMember]), CacheModule.register()],
  controllers: [QuizzesController, QuizzesAiController],
  providers: [
    QuizzesService,
    AiQuizGeneratorService,
    AiRateLimitService,
    CompaniesService,
    CompanyMembersService,
    AppLogger,
  ],
  exports: [QuizzesService],
})
export class QuizzesModule {}
