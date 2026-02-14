import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompanyMember } from './../entities/company-member.entity';
import { CompanyInvitation } from './../entities/company-invitation.entity';
import { CompanyJoinRequest } from './../entities/company-join-request.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { PaginatedResultDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyInvitationsPaginationDto } from '../dto/req/company-invitations-pagination.dto';
import { CompanyMembersService } from './company-members.service';
import { CompanyEvents, CompanyInvitationEvent, CompanyMembershipEvent } from '../events/company.events';
import { Company } from '../entities/company.entity';

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
  ) {}

  async inviteUser(
    companyId: string,
    email: string,
    invitedById: string,
    message?: string,
  ): Promise<CompanyInvitation> {
    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new NotFoundException('User with this email not found');
    }

    const isMember = await this.companyMembersService.isMember(user.id, companyId);
    if (isMember) {
      throw new ConflictException('User is already a member of this company');
    }

    const existingInvitation = await this.invitationRepository.findOne({
      where: { userId: user.id, companyId },
    });
    if (existingInvitation) {
      throw new ConflictException('Invitation already exists for this user');
    }

    const existingRequest = await this.joinRequestRepository.findOne({
      where: { userId: user.id, companyId },
    });
    if (existingRequest) {
      throw new ConflictException('User has already sent a join request to this company');
    }

    const invitation = this.invitationRepository.create({
      userId: user.id,
      companyId,
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
    const invitation = await this.invitationRepository.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const member = await this.companyMembersService.addMember(userId, invitation.company.id, CompanyRole.MEMBER);
    await this.invitationRepository.remove(invitation);

    this.eventEmitter.emit(
      CompanyEvents.INVITATION_ACCEPTED,
      new CompanyMembershipEvent(userId, invitation.company.id),
    );

    return member;
  }

  async declineInvitation(slug: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.invitationRepository.remove(invitation);
  }

  async cancelInvitation(companyId: string, invitationId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { id: invitationId, companyId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.invitationRepository.remove(invitation);
  }

  async getCompanyInvitations(
    companyId: string,
    paginationOptions?: CompanyInvitationsPaginationDto,
  ): Promise<{ invitations: PaginatedResultDto<CompanyInvitation>; company: Company }> {
    const company = await this.companiesRepository.findOne({ where: { id: companyId } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const invitations = await createPaginatedResult(this.invitationRepository, paginationOptions, {
      where: { companyId },
      relations: ['user', 'inviter'],
    });

    return { invitations, company };
  }

  async getUserInvitations(
    userId: string,
    paginationOptions?: CompanyInvitationsPaginationDto,
  ): Promise<PaginatedResultDto<CompanyInvitation>> {
    return createPaginatedResult(this.invitationRepository, paginationOptions, {
      where: { userId },
      relations: ['company', 'user', 'inviter'],
    });
  }
}
