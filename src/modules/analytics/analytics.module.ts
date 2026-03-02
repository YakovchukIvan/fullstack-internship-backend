import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizAttempt } from '@/modules/companies/quizzes/entities/quiz-attempt.entity';
import { CompanyMember } from '@/modules/companies/entities/company-member.entity';
import { Company } from '@/modules/companies/entities/company.entity';
import { User } from '@/modules/users/entities/user.entity';
import { MemberAnalyticsController } from './controllers/member.analytics.controller';
import { CompanyAnalyticsController } from './controllers/company.analytics.controller';
import { MemberAnalyticsService } from './services/member-analytics.service';
import { CompanyAnalyticsService } from './services/company-analytics.service';
import { UserAnalyticsRepository } from './repositories/user-analytics.repository';
import { CompanyAnalyticsRepository } from './repositories/company-analytics.repository';
import { CompaniesService } from '@/modules/companies/services/companies.service';
import { CompanyRepository } from '@/modules/companies/repositories/company.repository';
import { CompanyMembersService } from '@/modules/companies/services/company-members.service';
import { CompanyMemberRepository } from '@/modules/companies/repositories/company-member.repository';
import { AppLogger } from '@/common/logger/app-logger';
import { MemberProfileAnalyticsService } from './services/member-profile-analytics.service';

@Module({
  imports: [TypeOrmModule.forFeature([QuizAttempt, CompanyMember, Company, User])],
  controllers: [MemberAnalyticsController, CompanyAnalyticsController],
  providers: [
    MemberAnalyticsService,
    CompanyAnalyticsService,
    MemberProfileAnalyticsService,
    UserAnalyticsRepository,
    CompanyAnalyticsRepository,
    CompaniesService,
    CompanyRepository,
    CompanyMembersService,
    CompanyMemberRepository,
    AppLogger,
  ],
  exports: [MemberAnalyticsService, CompanyAnalyticsService],
})
export class AnalyticsModule {}
