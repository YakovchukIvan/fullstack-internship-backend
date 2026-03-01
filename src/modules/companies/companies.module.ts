import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Company } from './entities/company.entity';
import { CompanyMember } from './entities/company-member.entity';
import { CompanyInvitation } from './entities/company-invitation.entity';
import { CompanyJoinRequest } from './entities/company-join-request.entity';
import { User } from '../users/entities/user.entity';
import { QuizAttempt } from './quizzes/entities/quiz-attempt.entity';
import { CompanyRepository } from './repositories/company.repository';
import { CompanyMemberRepository } from './repositories/company-member.repository';
import { CompanyInvitationRepository } from './repositories/company-invitation.repository';
import { CompanyJoinRequestRepository } from './repositories/company-join-request.repository';
import { CompaniesService } from './services/companies.service';
import { CompanyInvitationsService } from './services/company-invitations.service';
import { CompanyJoinRequestsService } from './services/company-join-requests.service';
import { CompanyMembersService } from './services/company-members.service';
import { CompaniesController } from './controllers/companies.controller';
import { CompanyMembersController } from './controllers/company-members.controller';
import { CompanyOwnerController } from './controllers/company-owner.controller';
import { CompanyRoleGuard } from './guards/company-role.guard';
import { QuizzesModule } from './quizzes/quizzes.module';
import { AnalyticsService } from '../analytics/services/analytics.service';
import { AnalyticsRepository } from '../analytics/repositories/analytics.repository';
import { AppLogger } from '@/common/logger/app-logger';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyMember, CompanyInvitation, CompanyJoinRequest, User, QuizAttempt]),
    QuizzesModule,
  ],
  controllers: [CompaniesController, CompanyOwnerController, CompanyMembersController],
  providers: [
    CompanyRepository,
    CompanyMemberRepository,
    CompanyInvitationRepository,
    CompanyJoinRequestRepository,
    CompaniesService,
    CompanyInvitationsService,
    CompanyJoinRequestsService,
    CompanyMembersService,
    CompanyRoleGuard,
    AnalyticsService,
    AnalyticsRepository,
    AppLogger,
  ],
  exports: [
    CompanyRepository,
    CompanyMemberRepository,
    CompanyInvitationRepository,
    CompanyJoinRequestRepository,
    CompaniesService,
    CompanyInvitationsService,
    CompanyJoinRequestsService,
    CompanyMembersService,
    QuizzesModule,
  ],
})
export class CompaniesModule {}
