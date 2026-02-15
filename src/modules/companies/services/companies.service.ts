import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserRole } from '@/common/enums/user-role.enum';
import { generateSlug } from '@/common/helpers/generate-slug.helper';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompaniesPaginationDto } from '../dto/req/company/companies-pagination.req.dto';
import { Company } from '@/modules/companies/entities/company.entity';
import { CompanyMembersService } from './company-members.service';
import { CreateCompanyDto } from '../dto/req/company/create-company.req.dto';
import { UpdateCompanyDto } from '../dto/req/company/update-company.req.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    private readonly companyMembersService: CompanyMembersService,
  ) {}

  async create(createCompanyDto: CreateCompanyDto, userId: string): Promise<Company> {
    const slug = generateSlug(createCompanyDto.name);

    const existing = await this.companyRepository.findOne({
      where: [{ name: createCompanyDto.name }, { slug }],
    });

    if (existing) {
      throw new ConflictException('Company with this name already exists');
    }

    const company = this.companyRepository.create({
      ...createCompanyDto,
      slug,
      ownerId: userId,
    });

    const savedCompany = await this.companyRepository.save(company);

    await this.companyMembersService.createInitialOwner(userId, savedCompany.id);

    return savedCompany;
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

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!company.isVisible) {
      const isSystemOwner = userRole === UserRole.OWNER;
      const isCompanyOwner = company.ownerId === userId;

      if (!isSystemOwner && !isCompanyOwner) {
        throw new NotFoundException('Company not found');
      }
    }

    return company;
  }

  async updateBySlug(slug: string, dto: UpdateCompanyDto): Promise<Company> {
    const company = await this.companyRepository.findOne({ where: { slug } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

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
    if (!company) {
      throw new NotFoundException('Company not found');
    }
    await this.companyRepository.remove(company);
  }
}
