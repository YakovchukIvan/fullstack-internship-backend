import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompanyMember } from './../entities/company-member.entity';
import { CompanyInvitation } from './../entities/company-invitation.entity';
import { CompanyJoinRequest } from './../entities/company-join-request.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyPaginationDto } from '../dto/req/requests/company-invitations-pagination.req.dto';
import { CompanyMembersService } from './company-members.service';
import { CompanyEvents, CompanyInvitationEvent, CompanyMembershipEvent } from '../events/company.events';
import { Company } from '../entities/company.entity';
import { GuardAssertions } from '../guards/assert.helper';

@Injectable()
export class CompanyInvitationsService {
  constructor(
    @InjectRepository(CompanyInvitation)
    private readonly invitationRepository: Repository<CompanyInvitation>,
    @InjectRepository(CompanyJoinRequest)
    private readonly joinRequestRepository: Repository<CompanyJoinRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Company)
    private readonly companiesRepository: Repository<Company>,
    private readonly companyMembersService: CompanyMembersService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async inviteUser(slug: string, email: string, invitedById: string, message?: string): Promise<CompanyInvitation> {
    const company = await this.companiesRepository.findOne({ where: { slug } });
    GuardAssertions.exists(company, 'Company not found');

    const user = await this.userRepository.findOne({ where: { email } });
    GuardAssertions.exists(user, 'User with this email not found');

    const isMember = await this.companyMembersService.isMember(user.id, company.id);
    GuardAssertions.notExists(isMember, 'User is already a member of this company');

    const existingInvitation = await this.invitationRepository.findOne({
      where: { userId: user.id, companyId: company.id },
    });
    GuardAssertions.notExists(existingInvitation, 'Invitation already exists for this user');

    const existingRequest = await this.joinRequestRepository.findOne({
      where: { userId: user.id, companyId: company.id },
    });
    GuardAssertions.notExists(existingRequest, 'User has already sent a join request to this company');

    const invitation = this.invitationRepository.create({
      userId: user.id,
      companyId: company.id,
      invitedBy: invitedById,
      message: message || null,
    });

    const savedInvitation = await this.invitationRepository.save(invitation);

    this.eventEmitter.emit(
      CompanyEvents.INVITATION_SENT,
      new CompanyInvitationEvent(savedInvitation.userId, savedInvitation.companyId, invitedById),
    );

    return this.invitationRepository.findOneOrFail({
      where: { id: savedInvitation.id },
      relations: ['user', 'company', 'inviter'],
    });
  }

  async acceptInvitation(slug: string, userId: string): Promise<CompanyMember> {
    return this.dataSource.transaction(async (manager) => {
      const invitation = await manager.findOne(CompanyInvitation, {
        where: { userId, company: { slug } },
        relations: ['company'],
      });
      GuardAssertions.exists(invitation, 'Invitation not found');

      const member = await this.companyMembersService.addMember(
        userId,
        invitation.company.id,
        CompanyRole.MEMBER,
        manager,
      );
      await manager.remove(invitation);

      this.eventEmitter.emit(
        CompanyEvents.INVITATION_ACCEPTED,
        new CompanyMembershipEvent(userId, invitation.company.id),
      );

      return member;
    });
  }

  async declineInvitation(slug: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
    });
    GuardAssertions.exists(invitation, 'Invitation not found');
    await this.invitationRepository.remove(invitation);
  }

  async cancelInvitation(slug: string, invitationId: string): Promise<void> {
    const company = await this.companiesRepository.findOne({ where: { slug } });
    GuardAssertions.exists(company, 'Company not found');

    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, companyId: company.id },
    });
    GuardAssertions.exists(invitation, 'Invitation not found');

    await this.invitationRepository.remove(invitation);
  }

  async getCompanyInvitations(
    slug: string,
    paginationOptions?: CompanyPaginationDto,
  ): Promise<{ invitations: PaginatedResultResponseDto<CompanyInvitation>; company: Company }> {
    const company = await this.companiesRepository.findOne({ where: { slug } });
    GuardAssertions.exists(company, 'Company not found');

    const invitations = await createPaginatedResult(this.invitationRepository, paginationOptions, {
      where: { companyId: company.id },
      relations: ['user', 'inviter'],
    });

    return { invitations, company };
  }

  async getUserInvitations(
    userId: string,
    paginationOptions?: CompanyPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyInvitation>> {
    return createPaginatedResult(this.invitationRepository, paginationOptions, {
      where: { userId },
      relations: ['company', 'user', 'inviter'],
    });
  }
}
