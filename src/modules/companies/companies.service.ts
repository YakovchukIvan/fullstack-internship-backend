import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Company } from './entities/company.entity';
import { CompanyMember } from './entities/company-member.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { generateSlug } from '@/common/helpers/generate-slug.helper';
import { CreateCompanyDto } from './dto/req/create-company.dto';
import { UpdateCompanyDto } from './dto/req/update-company.dto';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { CompaniesPaginationDto } from './dto/req/companies-pagination.dto';
import { CompanyMembersPaginationDto } from './dto/req/company-members-pagination.dto';
import { PaginatedResultDto } from '@/common/dto/res/paginated-result.dto';

@Injectable()
export class CompaniesService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyMember)
    private readonly companyMemberRepository: Repository<CompanyMember>,
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

    const ownerMember = this.companyMemberRepository.create({
      userId,
      companyId: savedCompany.id,
      role: CompanyRole.OWNER,
    });

    await this.companyMemberRepository.save(ownerMember);

    return savedCompany;
  }

  async findAll(
    userId: string,
    userRole?: UserRole,
    paginationOptions?: CompaniesPaginationDto,
  ): Promise<PaginatedResultDto<Company>> {
    if (userRole === UserRole.OWNER) {
      return createPaginatedResult(this.companyRepository, paginationOptions || {}, {
        relations: ['owner'],
      });
    }

    return createPaginatedResult(this.companyRepository, paginationOptions || {}, {
      where: [{ isVisible: true }, { ownerId: userId }],
      relations: ['owner'],
    });
  }

  async getCompanyMembersCount(companyId: string): Promise<number> {
    return this.companyMemberRepository.count({
      where: { companyId },
    });
  }

  private async findCompanyBySlug(slug: string, userId: string, userRole?: UserRole): Promise<Company> {
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

  async findBySlugWithMembers(
    slug: string,
    userId: string,
    userRole?: UserRole,
    paginationOptions?: CompanyMembersPaginationDto,
  ): Promise<{ company: Company; members: PaginatedResultDto<CompanyMember> }> {
    const company = await this.findCompanyBySlug(slug, userId, userRole);
    const members = await this.findCompanyMembers(company.id, paginationOptions);

    return { company, members };
  }

  async findCompanyMembers(
    companyId: string,
    paginationOptions?: CompanyMembersPaginationDto,
  ): Promise<PaginatedResultDto<CompanyMember>> {
    return createPaginatedResult(this.companyMemberRepository, paginationOptions || {}, {
      where: { companyId },
      relations: ['user'],
    });
  }

  async update(slug: string, updateCompanyDto: UpdateCompanyDto, userId: string, userRole: UserRole): Promise<Company> {
    const company = await this.findCompanyBySlug(slug, userId, userRole);

    if (updateCompanyDto.name && updateCompanyDto.name !== company.name) {
      const newSlug = generateSlug(updateCompanyDto.name);

      const existing = await this.companyRepository.findOne({
        where: { name: updateCompanyDto.name },
      });

      if (existing && existing.id !== company.id) {
        throw new ConflictException('Company with this name already exists');
      }

      company.slug = newSlug;
    }

    Object.assign(company, updateCompanyDto);

    return this.companyRepository.save(company);
  }

  async remove(slug: string, userId: string, userRole: UserRole): Promise<void> {
    const company = await this.findCompanyBySlug(slug, userId, userRole);
    await this.companyRepository.remove(company);
  }

  async findByOwnerId(ownerId: string): Promise<Company[]> {
    return this.companyRepository.find({
      where: { ownerId },
      order: { createdAt: 'DESC' },
    });
  }

  async getUserRoleInCompany(userId: string, companyId: string): Promise<CompanyRole | null> {
    const member = await this.companyMemberRepository.findOne({
      where: { userId, companyId },
    });

    return member?.role || null;
  }

  async canManageCompany(userId: string, companyId: string): Promise<boolean> {
    const role = await this.getUserRoleInCompany(userId, companyId);
    return role === CompanyRole.OWNER || role === CompanyRole.ADMIN;
  }

  async getUserRoleInCompanyBySlug(
    userId: string,
    slug: string,
  ): Promise<{ role: CompanyRole | null; companyId: string | null }> {
    const company = await this.companyRepository.findOne({
      where: { slug },
      select: ['id'],
    });

    if (!company) {
      return { role: null, companyId: null };
    }

    const role = await this.getUserRoleInCompany(userId, company.id);
    return { role, companyId: company.id };
  }
}
