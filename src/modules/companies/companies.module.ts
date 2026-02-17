import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompaniesService } from './services/companies.service';
import { CompaniesController } from './controllers/companies.controller';
import { Company } from './entities/company.entity';
import { CompanyMember } from './entities/company-member.entity';
import { CompanyRoleGuard } from './guards/company-role.guard';
import { CompanyInvitation } from './entities/company-invitation.entity';
import { CompanyJoinRequest } from './entities/company-join-request.entity';
import { User } from '../users/entities/user.entity';
import { CompanyInvitationsService } from './services/company-invitations.service';
import { CompanyJoinRequestsService } from './services/company-join-requests.service';
import { CompanyMembersService } from './services/company-members.service';
import { CompanyMembersController } from './controllers/company-members.controller';
import { CompanyOwnerController } from './controllers/company-owner.controller';
import { QuizzesModule } from './quizzes/quizzes.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Company, CompanyMember, CompanyInvitation, CompanyJoinRequest, User]),
    QuizzesModule,
  ],
  controllers: [CompaniesController, CompanyOwnerController, CompanyMembersController],
  providers: [
    CompaniesService,
    CompanyInvitationsService,
    CompanyJoinRequestsService,
    CompanyMembersService,
    CompanyRoleGuard,
  ],
  exports: [
    CompaniesService,
    CompanyInvitationsService,
    CompanyJoinRequestsService,
    CompanyMembersService,
    QuizzesModule,
  ],
})
export class CompaniesModule {}
