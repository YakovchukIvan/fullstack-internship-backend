import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { CompanyMember } from '../entities/company-member.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { CompaniesPaginationDto } from '../dto/req/company/companies-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { UserRole } from '@/common/enums/user-role.enum';
import { CompanyRole } from '@/common/enums/company-role.enum';

export type CompanyWithMemberRole = Company & { companyMemberRole: CompanyRole | null };

interface MemberRoleRaw {
  member_role: CompanyRole | null;
}

@Injectable()
export class CompanyRepository extends Repository<Company> {
  constructor(dataSource: DataSource) {
    super(Company, dataSource.createEntityManager());
  }

  async findBySlugOrFail(slug: string): Promise<Company> {
    const company = await this.findOne({ where: { slug }, relations: ['owner'] });
    GuardAssertions.exists(company, 'Company not found');
    return company;
  }

  async findBySlugRaw(slug: string): Promise<Company | null> {
    return this.findOne({ where: { slug } });
  }

  async findPaginated(
    userId: string,
    userRole: UserRole | undefined,
    dto: CompaniesPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyWithMemberRole>> {
    if (userRole === UserRole.OWNER) {
      const result = await createPaginatedResult(this, dto);
      return {
        ...result,
        detail: result.detail.map((c) => ({ ...c, companyMemberRole: null })),
      };
    }

    return this.findPaginatedForUser(userId, dto);
  }

  private async findPaginatedForUser(
    userId: string,
    dto: CompaniesPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyWithMemberRole>> {
    const page = dto.page || 1;
    const limit = dto.limit || 10;
    const sortBy = dto.sortBy ?? 'createdAt';
    const order = (dto.order ?? 'ASC') as 'ASC' | 'DESC';

    const qb = this.createQueryBuilder('company')
      .leftJoin(CompanyMember, 'member', 'member.companyId = company.id AND member.userId = :userId', { userId })
      .addSelect('member.role', 'member_role')
      .where('company.isVisible = true OR company.ownerId = :userId OR member.userId = :userId', { userId })
      .orderBy(`company.${sortBy}`, order)
      .skip((page - 1) * limit)
      .take(limit);

    const [{ entities, raw }, total] = await Promise.all([qb.getRawAndEntities<MemberRoleRaw>(), qb.getCount()]);

    const detail: CompanyWithMemberRole[] = entities.map((company, index) => ({
      ...company,
      companyMemberRole: raw[index]?.member_role ?? null,
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      detail,
      pagination: {
        total,
        limit,
        offset: (page - 1) * limit,
        page,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }
}
