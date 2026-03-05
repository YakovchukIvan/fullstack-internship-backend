import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Company } from '../entities/company.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { CompaniesPaginationDto } from '../dto/req/company/companies-pagination.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { UserRole } from '@/common/enums/user-role.enum';

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
  ): Promise<PaginatedResultResponseDto<Company>> {
    if (userRole === UserRole.OWNER) {
      return createPaginatedResult(this, dto, { relations: ['owner'] });
    }

    return createPaginatedResult(this, dto, {
      where: [{ isVisible: true }, { ownerId: userId }],
      relations: ['owner'],
    });
  }
}
