import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { PaginatedResultDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyMembersPaginationDto } from '../dto/req/company-members-pagination.dto';
import { CompanyMember } from '../entities/company-member.entity';
import { Company } from '../entities/company.entity';

@Injectable()
export class CompanyMembersService {
  constructor(
    @InjectRepository(Company)
    private readonly companyRepository: Repository<Company>,
    @InjectRepository(CompanyMember)
    private readonly companyMemberRepository: Repository<CompanyMember>,
  ) {}

  async findCompanyMembers(
    companyId: string,
    paginationOptions?: CompanyMembersPaginationDto,
  ): Promise<PaginatedResultDto<CompanyMember>> {
    return createPaginatedResult(this.companyMemberRepository, paginationOptions, {
      where: { companyId },
      relations: ['user'],
    });
  }

  async removeMember(slug: string, memberUserId: string, removedById: string): Promise<void> {
    const company = await this.companyRepository.findOne({ where: { slug } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const canManage = await this.canManageCompany(removedById, company.id);
    if (!canManage) {
      throw new ForbiddenException('Only company owner or admin can remove members');
    }

    const member = await this.companyMemberRepository.findOne({
      where: { userId: memberUserId, companyId: company.id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot remove company owner');
    }

    const removerRole = await this.getUserRoleInCompany(removedById, company.id);
    if (removerRole === CompanyRole.ADMIN && member.role === CompanyRole.ADMIN) {
      throw new ForbiddenException('Admin cannot remove another admin');
    }

    await this.companyMemberRepository.remove(member);
  }

  async leaveCompany(slug: string, userId: string): Promise<void> {
    const company = await this.companyRepository.findOne({ where: { slug } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const member = await this.companyMemberRepository.findOne({
      where: { userId, companyId: company.id },
    });

    if (!member) {
      throw new NotFoundException('You are not a member of this company');
    }

    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Company owner cannot leave the company. Delete the company instead.');
    }

    await this.companyMemberRepository.remove(member);
  }

  async getUserRoleInCompany(userId: string, companyId: string): Promise<CompanyRole | null> {
    const member = await this.companyMemberRepository.findOne({
      where: { userId, companyId },
    });

    return member?.role || null;
  }

  async getCompanyMembersCount(companyId: string): Promise<number> {
    return this.companyMemberRepository.count({
      where: { companyId },
    });
  }

  async canManageCompany(userId: string, companyId: string): Promise<boolean> {
    const role = await this.getUserRoleInCompany(userId, companyId);
    return role === CompanyRole.OWNER || role === CompanyRole.ADMIN;
  }

  async updateMemberRole(
    slug: string,
    memberUserId: string,
    newRole: CompanyRole,
    updatedById: string,
  ): Promise<CompanyMember> {
    const company = await this.companyRepository.findOne({ where: { slug } });
    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const updaterRole = await this.getUserRoleInCompany(updatedById, company.id);
    if (updaterRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Only company owner can change member roles');
    }

    const member = await this.companyMemberRepository.findOne({
      where: { userId: memberUserId, companyId: company.id },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot change owner role');
    }

    member.role = newRole;
    return this.companyMemberRepository.save(member);
  }

  async getCompanyAdmins(companyId: string): Promise<CompanyMember[]> {
    return this.companyMemberRepository.find({
      where: [
        { companyId, role: CompanyRole.OWNER },
        { companyId, role: CompanyRole.ADMIN },
      ],
      relations: ['user'],
    });
  }

  async getMemberRoleBySlug(userId: string, slug: string) {
    const member = await this.companyMemberRepository.findOne({
      where: {
        userId,
        company: { slug },
      },
      relations: ['company'],
      select: {
        id: true,
        role: true,
        company: { id: true },
      },
    });

    return {
      role: member?.role || null,
      companyId: member?.company?.id || null,
    };
  }

  async isMember(userId: string, companyId: string): Promise<boolean> {
    const member = await this.companyMemberRepository.findOne({ where: { userId, companyId } });
    return !!member;
  }

  async addMember(userId: string, companyId: string, role: CompanyRole): Promise<CompanyMember> {
    const member = this.companyMemberRepository.create({ userId, companyId, role });
    const savedMember = await this.companyMemberRepository.save(member);

    return this.companyMemberRepository.findOneOrFail({
      where: { id: savedMember.id },
      relations: ['user'],
    });
  }
}
