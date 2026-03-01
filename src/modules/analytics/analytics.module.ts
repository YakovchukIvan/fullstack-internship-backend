import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import { AnalyticsController } from './controllers/analytics.controller';
import { AnalyticsService } from './services/analytics.service';
import { AnalyticsRepository } from './repositories/analytics.repository';
import { CompaniesService } from '@/modules/companies/services/companies.service';
import { CompanyRepository } from '@/modules/companies/repositories/company.repository';
import { CompanyMembersService } from '@/modules/companies/services/company-members.service';
import { CompanyMemberRepository } from '@/modules/companies/repositories/company-member.repository';
import { AppLogger } from '@/common/logger/app-logger';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAttempt])],
  controllers: [AnalyticsController],
  providers: [
    AnalyticsService,
    AnalyticsRepository,
    CompaniesService,
    CompanyRepository,
    CompanyMembersService,
    CompanyMemberRepository,
    AppLogger,
  ],
})
export class AnalyticsModule {}
