import { Injectable, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { generateSlug } from '@/common/helpers/generate-slug.helper';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompaniesPaginationDto } from '../dto/req/company/companies-pagination.req.dto';
import { Company } from '../entities/company.entity';
import { CreateCompanyDto } from '../dto/req/company/create-company.req.dto';
import { UpdateCompanyDto } from '../dto/req/company/update-company.req.dto';
import { CompanyRepository } from '../repositories/company.repository';
import { CompanyMembersService } from './company-members.service';
import { GuardAssertions } from '@/common/helpers/assert.helper';

@Injectable()
export class CompaniesService {
  constructor(
    private readonly companyRepository: CompanyRepository,
    private readonly companyMembersService: CompanyMembersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(dto: CreateCompanyDto, userId: string): Promise<Company> {
    return this.dataSource.transaction(async (manager) => {
      const slug = generateSlug(dto.name);
      const existing = await manager.findOne(Company, { where: [{ name: dto.name }, { slug }] });

      GuardAssertions.notExists(existing, 'Company with this name already exists');

      const company = manager.create(Company, { ...dto, slug, ownerId: userId });
      const saved = await manager.save(Company, company);
      await this.companyMembersService.createInitialOwner(userId, saved.id, manager);
      return saved;
    });
  }

  async findAll(
    userId: string,
    dto: CompaniesPaginationDto,
    userRole?: UserRole,
  ): Promise<PaginatedResultResponseDto<Company>> {
    return this.companyRepository.findPaginated(userId, userRole, dto);
  }

  async findBySlug(slug: string, userId: string, userRole?: UserRole): Promise<Company> {
    const company = await this.companyRepository.findBySlugOrFail(slug);

    if (!company.isVisible) {
      const isSystemOwner = userRole === UserRole.OWNER;
      const isCompanyOwner = company.ownerId === userId;

      GuardAssertions.isTrue(isSystemOwner || isCompanyOwner, 'Company not found');
    }

    return company;
  }

  async updateBySlug(slug: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepository.findBySlugRaw(slug);
    GuardAssertions.exists(company, 'Company not found');

    if (dto.name && dto.name !== company.name) {
      const newSlug = generateSlug(dto.name);
      const existing = await this.companyRepository.findBySlugRaw(newSlug);
      if (existing && existing.id !== company.id) {
        throw new ConflictException('Company with this name already exists');
      }
      company.slug = newSlug;
    }

    Object.assign(company, dto);
    return this.companyRepository.save(company);
  }

  async removeBySlug(slug: string): Promise<void> {
    const company = await this.companyRepository.findBySlugRaw(slug);
    GuardAssertions.exists(company, 'Company not found');
    await this.companyRepository.remove(company);
  }
}
