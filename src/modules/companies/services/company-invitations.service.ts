import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { CompanyMember } from './../entities/company-member.entity';
import { CompanyInvitation } from './../entities/company-invitation.entity';
import { CompanyJoinRequest } from './../entities/company-join-request.entity';
import { User } from '@/modules/users/entities/user.entity';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { PaginatedResultDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyInvitationsPaginationDto } from '../dto/req/company-invitations-pagination.dto';
import { CompanyMembersService } from './company-members.service';

@Injectable()
export class CompanyInvitationsService {
  constructor(
    @InjectRepository(CompanyInvitation)
    private readonly invitationRepository: Repository<CompanyInvitation>,
    @InjectRepository(CompanyJoinRequest)
    private readonly joinRequestRepository: Repository<CompanyJoinRequest>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly companyMembersService: CompanyMembersService,
  ) {}

  async inviteUser(companyId: string, email: string, invitedById: string): Promise<CompanyInvitation> {
    const canManage = await this.companyMembersService.canManageCompany(invitedById, companyId);
    if (!canManage) {
      throw new ForbiddenException('Only company owner or admin can invite users');
    }

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
    });

    return this.invitationRepository.save(invitation);
  }

  async acceptInvitation(companyId: string, userId: string): Promise<CompanyMember> {
    const invitation = await this.invitationRepository.findOne({
      where: { userId, companyId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    const member = await this.companyMembersService.addMember(userId, companyId, CompanyRole.MEMBER);
    await this.invitationRepository.remove(invitation);

    return member;
  }

  async declineInvitation(companyId: string, userId: string): Promise<void> {
    const invitation = await this.invitationRepository.findOne({
      where: { userId, companyId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.invitationRepository.remove(invitation);
  }

  async cancelInvitation(companyId: string, userId: string, cancelledById: string): Promise<void> {
    const canManage = await this.companyMembersService.canManageCompany(cancelledById, companyId);
    if (!canManage) {
      throw new ForbiddenException('Only company owner or admin can cancel invitations');
    }

    const invitation = await this.invitationRepository.findOne({
      where: { userId, companyId },
    });

    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    await this.invitationRepository.remove(invitation);
  }

  async getCompanyInvitations(
    companyId: string,
    requesterId: string,
    paginationOptions?: CompanyInvitationsPaginationDto,
  ): Promise<PaginatedResultDto<CompanyInvitation>> {
    const canManage = await this.companyMembersService.canManageCompany(requesterId, companyId);
    if (!canManage) {
      throw new ForbiddenException('Only company owner or admin can view invitations');
    }

    return createPaginatedResult(this.invitationRepository, paginationOptions, {
      where: { companyId },
      relations: ['company', 'user', 'inviter'],
    });
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
