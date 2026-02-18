import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { generateSlug } from '@/common/helpers/generate-slug.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompaniesPaginationDto } from '../dto/req/company/companies-pagination.req.dto';
import { Company } from '@/modules/companies/entities/company.entity';
import { CompanyMembersService } from './company-members.service';
import { CreateCompanyDto } from '../dto/req/company/create-company.req.dto';
import { UpdateCompanyDto } from '../dto/req/company/update-company.req.dto';
import { GuardAssertions } from '@/common/helpers/assert.helper';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly companyMembersService: CompanyMembersService,
    private readonly dataSource: DataSource,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string): Promise<Company> {
    return this.dataSource.transaction(async (manager) => {
      const slug = generateSlug(createCompanyDto.name);

      const existing = await manager.findOne(Company, {
        where: [{ name: createCompanyDto.name }, { slug }],
      });

      GuardAssertions.notExists(existing, 'Company with this name already exists');

      const company = manager.create(Company, {
        ...createCompanyDto,
        slug,
        ownerId: userId,
      });

      const savedCompany = await manager.save(Company, company);
      await this.companyMembersService.createInitialOwner(userId, savedCompany.id, manager);
      return savedCompany;
    });
  }

  async findAll(
    userId: string,
    userRole?: UserRole,
    paginationOptions?: CompaniesPaginationDto,
  ): Promise<PaginatedResultResponseDto<Company>> {
    if (userRole === UserRole.OWNER) {
      return createPaginatedResult(this.companyRepository, paginationOptions, {
        relations: ['owner'],
      });
    }

    return createPaginatedResult(this.companyRepository, paginationOptions, {
      where: [{ isVisible: true }, { ownerId: userId }],
      relations: ['owner'],
    });
  }

  async findBySlug(slug: string, userId: string, userRole?: UserRole): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { slug },
      relations: ['owner'],
    });

    GuardAssertions.exists(company, 'Company not found');

    if (!company.isVisible) {
      const isSystemOwner = userRole === UserRole.OWNER;
      const isCompanyOwner = company.ownerId === userId;

      GuardAssertions.isTrue(isSystemOwner || isCompanyOwner, 'Company not found');
    }

    return company;
  }

  async updateBySlug(slug: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { slug } });
    GuardAssertions.exists(company, 'Company not found');

    if (dto.name && dto.name !== company.name) {
      const newSlug = generateSlug(dto.name);

      const existing = await this.companyRepository.findOne({
        where: { slug: newSlug },
      });

      if (existing && existing.id !== company.id) {
        throw new ConflictException('Company with this name already exists');
      }

      company.slug = newSlug;
    }

    Object.assign(company, dto);
    return this.companyRepository.save(company);
  }

  async removeBySlug(slug: string): Promise<void> {
    const company = await this.companyRepository.findOne({ where: { slug } });
    GuardAssertions.exists(company, 'Company not found');
    await this.companyRepository.remove(company);
  }
}
