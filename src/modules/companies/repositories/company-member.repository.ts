import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { CompanyMember } from '../entities/company-member.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { CompanyMembersPaginationDto } from '../dto/req/members/company-members-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';

@Injectable()
export class CompanyMemberRepository extends Repository<CompanyMember> {
  constructor(dataSource: DataSource) {
    super(CompanyMember, dataSource.createEntityManager());
  }

  async findMemberWithUserOrFail(companyId: string, userId: string): Promise<CompanyMember> {
    const member = await this.findOne({
      where: { companyId, userId },
      relations: ['user'],
    });
    GuardAssertions.exists(member, `Company member not found for user ${userId}`);
    return member;
  }

  async findMemberBySlugOrFail(slug: string, memberId: string): Promise<CompanyMember> {
    const member = await this.findOne({
      where: { id: memberId, company: { slug } },
      relations: ['company', 'user'],
    });
    GuardAssertions.exists(member, 'Member not found');
    return member;
  }

  async findMembershipBySlug(userId: string, slug: string): Promise<CompanyMember | null> {
    return this.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
      select: { id: true, role: true, company: { id: true } },
    });
  }

  async findAllByCompanyId(companyId: string): Promise<CompanyMember[]> {
    return this.find({ where: { companyId } });
  }

  async getUserRoleInCompany(userId: string, companyId: string): Promise<CompanyRole | null> {
    const member = await this.findOne({ where: { userId, companyId } });
    return member?.role ?? null;
  }

  async isMember(userId: string, companyId: string): Promise<boolean> {
    return this.exists({ where: { userId, companyId } });
  }

  async findBySlugAndUserOrFail(slug: string, userId: string): Promise<CompanyMember> {
    const member = await this.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
    });
    GuardAssertions.exists(member, 'Member not found');
    return member;
  }

  async findPaginatedByCompany(
    companyId: string,
    dto: CompanyMembersPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyMember>> {
    return createPaginatedResult(this, dto, {
      where: { companyId },
      relations: ['user'],
    });
  }

  async findPaginatedByUser(
    userId: string,
    dto: CompanyMembersPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyMember>> {
    return createPaginatedResult(this, dto, {
      where: dto.role ? { userId, role: dto.role } : { userId },
      relations: ['company', 'user'],
    });
  }
}
