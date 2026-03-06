import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CompanyJoinRequest } from '../entities/company-join-request.entity';
import { CompanyMember } from '../entities/company-member.entity';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyInteractionsPaginationDto } from '../dto/req/company/company-interactions-pagination.req.dto';
import { CompanyMembersService } from './company-members.service';
import { CompanyEvents } from '../events/company.events';
import { Company } from '../entities/company.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyInvitationRepository } from '../repositories/company-invitation.repository';
import { CompanyJoinRequestRepository } from '../repositories/company-join-request.repository';
import { CompanyJoinRequestEvent } from '../events/company-join-request.event';
import { CompanyJoinRequestAcceptedEvent } from '../events/company-join-request-accepted.event';

@Injectable()
export class CompanyJoinRequestsService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly invitationRepository: CompanyInvitationRepository,
    private readonly joinRequestRepository: CompanyJoinRequestRepository,
    private readonly companyMembersService: CompanyMembersService,
    private readonly eventEmitter: EventEmitter2,
    private readonly dataSource: DataSource,
  ) {}

  async sendJoinRequest(slug: string, userId: string): Promise<CompanyJoinRequest> {
    const company = await this.companyRepository.findBySlugOrFail(slug);

    const isMember = await this.companyMembersService.isMember(userId, company.id);
    GuardAssertions.isTrueConflict(!isMember, 'You are already a member of this company');

    const [existingRequest, existingInvitation] = await Promise.all([
      this.joinRequestRepository.findByUserAndCompany(userId, company.id),
      this.invitationRepository.findByUserAndCompany(userId, company.id),
    ]);

    GuardAssertions.notExists(existingRequest, 'Join request already exists');
    GuardAssertions.notExists(existingInvitation, 'You have a pending invitation');

    const joinRequest = this.joinRequestRepository.create({ userId, companyId: company.id });
    const saved = await this.joinRequestRepository.save(joinRequest);

    const fullRequest = await this.joinRequestRepository.findOneOrFail({
      where: { id: saved.id },
      relations: ['user'],
    });

    this.eventEmitter.emit(
      CompanyEvents.JOIN_REQUEST_SENT,
      new CompanyJoinRequestEvent(
        fullRequest.userId,
        `${fullRequest.user.firstName} ${fullRequest.user.lastName}`,
        company.id,
        company.name,
      ),
    );

    return fullRequest;
  }

  async acceptJoinRequest(slug: string, requestId: string): Promise<CompanyMember> {
    return this.dataSource.transaction(async (manager) => {
      const company = await this.companyRepository.findBySlugOrFail(slug);
      const joinRequest = await this.joinRequestRepository.findByIdInCompanyOrFail(requestId, company.id);

      const fullRequest = await this.joinRequestRepository.findOneOrFail({
        where: { id: joinRequest.id },
        relations: ['user'],
      });

      const member = await this.companyMembersService.addMember(
        joinRequest.userId,
        company.id,
        CompanyRole.MEMBER,
        manager,
      );
      await manager.remove(joinRequest);

      this.eventEmitter.emit(
        CompanyEvents.JOIN_REQUEST_ACCEPTED,
        new CompanyJoinRequestAcceptedEvent(
          fullRequest.userId,
          `${fullRequest.user.firstName} ${fullRequest.user.lastName}`,
          company.id,
          company.name,
        ),
      );

      return member;
    });
  }

  async declineJoinRequest(slug: string, requestId: string): Promise<void> {
    const company = await this.companyRepository.findBySlugOrFail(slug);
    const joinRequest = await this.joinRequestRepository.findByIdInCompanyOrFail(requestId, company.id);
    await this.joinRequestRepository.remove(joinRequest);
  }

  async cancelJoinRequest(slug: string, userId: string): Promise<void> {
    const joinRequest = await this.joinRequestRepository.findBySlugAndUserOrFail(slug, userId);
    await this.joinRequestRepository.remove(joinRequest);
  }

  async getCompanyJoinRequests(
    slug: string,
    dto: CompanyInteractionsPaginationDto,
  ): Promise<{ joinRequests: PaginatedResultResponseDto<CompanyJoinRequest>; company: Company }> {
    const company = await this.companyRepository.findBySlugOrFail(slug);
    const joinRequests = await this.joinRequestRepository.findPaginatedByCompany(company.id, dto);
    return { joinRequests, company };
  }

  async getUserJoinRequests(
    userId: string,
    dto: CompanyInteractionsPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyJoinRequest>> {
    return this.joinRequestRepository.findPaginatedByUser(userId, dto);
  }
}
