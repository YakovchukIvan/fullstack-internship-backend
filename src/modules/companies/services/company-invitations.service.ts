import { InjectRepository } from '@nestjs/typeorm';
import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompanyInvitation } from '../entities/company-invitation.entity';
import { CompanyMember } from '../entities/company-member.entity';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyPaginationDto } from '../dto/req/requests/company-invitations-pagination.req.dto';
import { CompanyMembersService } from './company-members.service';
import { CompanyEvents, CompanyInvitationEvent, CompanyMembershipEvent } from '../events/company.events';
import { Company } from '../entities/company.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyInvitationRepository } from '../repositories/company-invitation.repository';
import { CompanyJoinRequestRepository } from '../repositories/company-join-request.repository';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class CompanyInvitationsService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly companyRepository: CompanyRepository,
    private readonly invitationRepository: CompanyInvitationRepository,
    private readonly joinRequestRepository: CompanyJoinRequestRepository,
    private readonly companyMembersService: CompanyMembersService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async inviteUser(slug: string, email: string, invitedById: string, message?: string): Promise<CompanyInvitation> {
    const company = await this.companyRepository.findBySlugOrFail(slug);

    const user = await this.userRepository.findOne({ where: { email } });
    GuardAssertions.exists(user, 'User with this email not found');

    const isMember = await this.companyMembersService.isMember(user.id, company.id);
    GuardAssertions.isTrueConflict(!isMember, 'User is already a member of this company');

    const [existingInvitation, existingRequest] = await Promise.all([
      this.invitationRepository.findByUserAndCompany(user.id, company.id),
      this.joinRequestRepository.findByUserAndCompany(user.id, company.id),
    ]);

    GuardAssertions.notExists(existingInvitation, 'Invitation already exists for this user');
    GuardAssertions.notExists(existingRequest, 'User has already sent a join request to this company');

    const invitation = this.invitationRepository.create({
      userId: user.id,
      companyId: company.id,
      invitedBy: invitedById,
      message: message ?? null,
    });

    const saved = await this.invitationRepository.save(invitation);
    this.eventEmitter.emit(
      CompanyEvents.INVITATION_SENT,
      new CompanyInvitationEvent(saved.userId, saved.companyId, invitedById),
    );

    return this.invitationRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ['user', 'company', 'inviter'],
    });
  }

  async acceptInvitation(slug: string, userId: string): Promise<CompanyMember> {
    return this.dataSource.transaction(async (manager) => {
      const invitation = await this.invitationRepository.findBySlugAndUserOrFail(slug, userId);
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
    const invitation = await this.invitationRepository.findBySlugAndUserOrFail(slug, userId);
    await this.invitationRepository.remove(invitation);
  }

  async cancelInvitation(slug: string, invitationId: string): Promise<void> {
    const company = await this.companyRepository.findBySlugOrFail(slug);
    const invitation = await this.invitationRepository.findByIdInCompanyOrFail(invitationId, company.id);
    await this.invitationRepository.remove(invitation);
  }

  async getCompanyInvitations(
    slug: string,
    dto?: CompanyPaginationDto,
  ): Promise<{ invitations: PaginatedResultResponseDto<CompanyInvitation>; company: Company }> {
    const company = await this.companyRepository.findBySlugOrFail(slug);
    const invitations = await this.invitationRepository.findPaginatedByCompany(company.id, dto);
    return { invitations, company };
  }

  async getUserInvitations(
    userId: string,
    dto?: CompanyPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyInvitation>> {
    return this.invitationRepository.findPaginatedByUser(userId, dto);
  }
}
