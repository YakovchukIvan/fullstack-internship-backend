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

  async findAll(userRole?: UserRole): Promise<Company[]> {
    if (userRole === UserRole.OWNER) {
      return this.companyRepository.find({
        order: { createdAt: 'DESC' },
        relations: ['owner'],
      });
    }

    return this.companyRepository.find({
      where: { isVisible: true },
      order: { createdAt: 'DESC' },
      relations: ['owner'],
    });
  }

  async findBySlug(slug: string, userRole?: UserRole): Promise<Company> {
    const company = await this.companyRepository.findOne({
      where: { slug },
      relations: ['owner', 'members', 'members.user'],
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (!company.isVisible && userRole !== UserRole.OWNER) {
      throw new NotFoundException('Company not found');
    }

    return company;
  }

  async update(slug: string, updateCompanyDto: UpdateCompanyDto, userRole?: UserRole): Promise<Company> {
    const company = await this.findBySlug(slug, userRole);

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

    return this.companyRepository.save(company);
  }

  async remove(slug: string, userRole?: UserRole): Promise<void> {
    const company = await this.findBySlug(slug, userRole);
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
}
