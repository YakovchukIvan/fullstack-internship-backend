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
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { CompaniesPaginationDto } from './dto/req/companies-pagination.dto';
import { CompanyMembersPaginationDto } from './dto/req/company-members-pagination.dto';

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

    const existingByName = await this.companyRepository.findOne({
      where: { name: createCompanyDto.name },
    });

    if (existingByName) {
      throw new ConflictException('Company with this name already exists');
    }

    const existingBySlug = await this.companyRepository.findOne({
      where: { slug },
    });

    if (existingBySlug) {
      throw new ConflictException('Company with this slug already exists');
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

  async findAll(userRole?: UserRole, paginationOptions?: CompaniesPaginationDto): Promise<PaginatedResult<Company>> {
    const whereCondition = userRole === UserRole.OWNER ? {} : { isVisible: true };

    return createPaginatedResult(this.companyRepository, paginationOptions || {}, {
      where: whereCondition,
      relations: ['owner'],
    });
  }

  private async findCompanyBySlug(slug: string, userRole?: UserRole): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { slug },
      relations: ['owner'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!company.isVisible && userRole !== UserRole.OWNER) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async findBySlug(slug: string, userRole?: UserRole): Promise<{ company: Company; membersCount: number }> {
    const company = await this.findCompanyBySlug(slug, userRole);

    const membersCount = await this.companyMemberRepository.count({
      where: { companyId: company.id },
    });

    return { company, membersCount };
  }

  async getMembersCount(companyId: string): Promise<number> {
    return this.companyMemberRepository.count({
      where: { companyId },
    });
  }

  async findCompanyMembers(
    companyId: string,
    paginationOptions?: CompanyMembersPaginationDto,
  ): Promise<PaginatedResult<CompanyMember>> {
    return createPaginatedResult(this.companyMemberRepository, paginationOptions || {}, {
      where: { companyId },
      relations: ['user'],
    });
  }

  async update(slug: string, updateCompanyDto: UpdateCompanyDto, userRole?: UserRole): Promise<Company> {
    const company = await this.findCompanyBySlug(slug, userRole);

    if (updateCompanyDto.name && updateCompanyDto.name !== company.name) {
      const newSlug = generateSlug(updateCompanyDto.name);

      const existingByName = await this.companyRepository.findOne({
        where: { name: updateCompanyDto.name },
      });

      if (existingByName) {
        throw new ConflictException('Company with this name already exists');
      }

      const existingBySlug = await this.companyRepository.findOne({
        where: { slug: newSlug },
      });

      if (existingBySlug) {
        throw new ConflictException('Company with this slug already exists');
      }

      company.name = updateCompanyDto.name;
      company.slug = newSlug;
    }

    if (updateCompanyDto.description !== undefined) {
      company.description = updateCompanyDto.description;
    }

    if (updateCompanyDto.avatarUrl !== undefined) {
      company.avatarUrl = updateCompanyDto.avatarUrl;
    }

    if (updateCompanyDto.isVisible !== undefined) {
      company.isVisible = updateCompanyDto.isVisible;
    }

    return this.companyRepository.save(company);
  }

  async remove(slug: string, userRole?: UserRole): Promise<void> {
    const company = await this.findCompanyBySlug(slug, userRole);
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

  async isCompanyOwner(userId: string, companyId: string): Promise<boolean> {
    const role = await this.getUserRoleInCompany(userId, companyId);
    return role === CompanyRole.OWNER;
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
