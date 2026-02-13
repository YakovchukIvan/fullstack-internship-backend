import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompanyMember } from './../entities/company-member.entity';
import { CompanyInvitation } from './../entities/company-invitation.entity';
import { CompanyJoinRequest } from './../entities/company-join-request.entity';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { PaginatedResultDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyInvitationsPaginationDto } from '../dto/req/company-invitations-pagination.dto';
import { CompanyMembersService } from './company-members.service';
import { CompanyEvents, CompanyMembershipEvent } from '../events/company.events';

@Injectable()
export class CompanyJoinRequestsService {
  constructor(
    @InjectRepository(CompanyInvitation)
    private readonly invitationRepository: Repository<CompanyInvitation>,
    @InjectRepository(CompanyJoinRequest)
    private readonly joinRequestRepository: Repository<CompanyJoinRequest>,
    private readonly companyMembersService: CompanyMembersService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async sendJoinRequest(companyId: string, userId: string): Promise<CompanyJoinRequest> {
    const isMember = await this.companyMembersService.isMember(userId, companyId);
    if (isMember) {
      throw new ConflictException('You are already a member of this company');
    }

    const [existingRequest, existingInvitation] = await Promise.all([
      this.joinRequestRepository.findOne({ where: { userId, companyId } }),
      this.invitationRepository.findOne({ where: { userId, companyId } }),
    ]);

    if (existingRequest) {
      throw new ConflictException('Join request already exists');
    }
    if (existingInvitation) {
      throw new ConflictException('You have a pending invitation');
    }

    const joinRequest = this.joinRequestRepository.create({ userId, companyId });
    const savedRequest = await this.joinRequestRepository.save(joinRequest);

    this.eventEmitter.emit(CompanyEvents.JOIN_REQUEST_CREATED, new CompanyMembershipEvent(userId, companyId));

    return this.joinRequestRepository.findOneOrFail({
      where: { id: savedRequest.id },
      relations: ['company', 'user'],
    });
  }

  async acceptJoinRequest(companyId: string, requestUserId: string): Promise<CompanyMember> {
    const joinRequest = await this.joinRequestRepository.findOne({
      where: { userId: requestUserId, companyId },
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    const member = await this.companyMembersService.addMember(requestUserId, companyId, CompanyRole.MEMBER);
    await this.joinRequestRepository.remove(joinRequest);

    this.eventEmitter.emit(CompanyEvents.JOIN_REQUEST_ACCEPTED, new CompanyMembershipEvent(requestUserId, companyId));

    return member;
  }

  async declineJoinRequest(companyId: string, requestUserId: string): Promise<void> {
    const joinRequest = await this.joinRequestRepository.findOne({
      where: { userId: requestUserId, companyId },
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    await this.joinRequestRepository.remove(joinRequest);
  }

  async cancelJoinRequest(companyId: string, userId: string): Promise<void> {
    const joinRequest = await this.joinRequestRepository.findOne({
      where: { userId, companyId },
    });

    if (!joinRequest) {
      throw new NotFoundException('Join request not found');
    }

    await this.joinRequestRepository.remove(joinRequest);
  }

  async getCompanyJoinRequests(
    companyId: string,
    paginationOptions?: CompanyInvitationsPaginationDto,
  ): Promise<PaginatedResultDto<CompanyJoinRequest>> {
    return createPaginatedResult(this.joinRequestRepository, paginationOptions, {
      where: { companyId },
      relations: ['company', 'user'],
    });
  }

  async getUserJoinRequests(
    userId: string,
    paginationOptions?: CompanyInvitationsPaginationDto,
  ): Promise<PaginatedResultDto<CompanyJoinRequest>> {
    return createPaginatedResult(this.joinRequestRepository, paginationOptions, {
      where: { userId },
      relations: ['company', 'user'],
    });
  }
}
