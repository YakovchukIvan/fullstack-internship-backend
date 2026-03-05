import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CompanyJoinRequest } from '../entities/company-join-request.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { CompanyInteractionsPaginationDto } from '../dto/req/company/company-interactions-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';

@Injectable()
export class CompanyJoinRequestRepository extends Repository<CompanyJoinRequest> {
  constructor(dataSource: DataSource) {
    super(CompanyJoinRequest, dataSource.createEntityManager());
  }

  async findByUserAndCompany(userId: string, companyId: string): Promise<CompanyJoinRequest | null> {
    return this.findOne({ where: { userId, companyId } });
  }

  async findBySlugAndUserOrFail(slug: string, userId: string): Promise<CompanyJoinRequest> {
    const request = await this.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
    });
    GuardAssertions.exists(request, 'Join request not found');
    return request;
  }

  async findByIdInCompanyOrFail(requestId: string, companyId: string): Promise<CompanyJoinRequest> {
    const request = await this.findOne({ where: { id: requestId, companyId } });
    GuardAssertions.exists(request, 'Join request not found');
    return request;
  }

  async findPaginatedByCompany(
    companyId: string,
    dto: CompanyInteractionsPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyJoinRequest>> {
    return createPaginatedResult(this, dto, {
      where: { companyId },
      relations: ['user'],
    });
  }

  async findPaginatedByUser(
    userId: string,
    dto: CompanyInteractionsPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyJoinRequest>> {
    return createPaginatedResult(this, dto, {
      where: { userId },
      relations: ['company', 'user'],
    });
  }
}
