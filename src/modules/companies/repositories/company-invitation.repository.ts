import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CompanyInvitation } from '../entities/company-invitation.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { CompanyInteractionsPaginationDto } from '../dto/req/company/company-interactions-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';

@Injectable()
export class CompanyInvitationRepository extends Repository<CompanyInvitation> {
  constructor(dataSource: DataSource) {
    super(CompanyInvitation, dataSource.createEntityManager());
  }

  async findByUserAndCompany(userId: string, companyId: string): Promise<CompanyInvitation | null> {
    return this.findOne({ where: { userId, companyId } });
  }

  async findBySlugAndUserOrFail(slug: string, userId: string): Promise<CompanyInvitation> {
    const invitation = await this.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
    });
    GuardAssertions.exists(invitation, 'Invitation not found');
    return invitation;
  }

  async findByIdInCompanyOrFail(invitationId: string, companyId: string): Promise<CompanyInvitation> {
    const invitation = await this.findOne({ where: { id: invitationId, companyId } });
    GuardAssertions.exists(invitation, 'Invitation not found');
    return invitation;
  }

  async findPaginatedByCompany(
    companyId: string,
    dto?: CompanyInteractionsPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyInvitation>> {
    return createPaginatedResult(this, dto, {
      where: { companyId },
      relations: ['user', 'inviter'],
    });
  }

  async findPaginatedByUser(
    userId: string,
    dto?: CompanyInteractionsPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyInvitation>> {
    return createPaginatedResult(this, dto, {
      where: { userId },
      relations: ['company', 'user', 'inviter'],
    });
  }
}
