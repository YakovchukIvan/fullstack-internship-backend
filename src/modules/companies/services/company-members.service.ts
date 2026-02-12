import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { PaginatedResultDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyMembersPaginationDto } from '../dto/req/company-members-pagination.dto';
import { CompanyMember } from '../entities/company-member.entity';

@Injectable()
export class CompanyMembersService {
  constructor(
    @InjectRepository(CompanyMember)
    private readonly companyMemberRepository: Repository<CompanyMember>,
  ) {}

  async createInitialOwner(userId: string, companyId: string): Promise<CompanyMember> {
    return this.addMember(userId, companyId, CompanyRole.OWNER);
  }

  async addMember(userId: string, companyId: string, role: CompanyRole): Promise<CompanyMember> {
    const member = this.companyMemberRepository.create({ userId, companyId, role });
    const savedMember = await this.companyMemberRepository.save(member);

    return this.companyMemberRepository.findOneOrFail({
      where: { id: savedMember.id },
      relations: ['user'],
    });
  }

  async removeMember(companyId: string, memberUserId: string, removedById: string): Promise<void> {
    const [removerRole, member] = await Promise.all([
      this.getUserRoleInCompany(removedById, companyId),
      this.companyMemberRepository.findOne({ where: { userId: memberUserId, companyId } }),
    ]);

    if (!member) {
      throw new NotFoundException('Member not found');
    }
    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot remove owner');
    }

    if (removerRole === CompanyRole.ADMIN && member.role === CompanyRole.ADMIN) {
      throw new ForbiddenException('Admins cannot remove other admins');
    }

    await this.companyMemberRepository.remove(member);
  }

  async leaveCompany(companyId: string, userId: string): Promise<void> {
    const member = await this.companyMemberRepository.findOne({
      where: { userId, companyId },
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }
    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Owner cannot leave. Delete company instead.');
    }

    await this.companyMemberRepository.remove(member);
  }

  async updateMemberRole(
    companyId: string,
    memberUserId: string,
    newRole: CompanyRole,
    updatedById: string,
  ): Promise<CompanyMember> {
    const updaterRole = await this.getUserRoleInCompany(updatedById, companyId);

    if (updaterRole !== CompanyRole.OWNER) {
      throw new ForbiddenException('Only owner can change roles');
    }

    const member = await this.companyMemberRepository.findOne({
      where: { userId: memberUserId, companyId },
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

  async isMember(userId: string, companyId: string): Promise<boolean> {
    const count = await this.companyMemberRepository.count({ where: { userId, companyId } });
    return count > 0;
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

  async findCompanyMembers(
    companyId: string,
    paginationOptions?: CompanyMembersPaginationDto,
  ): Promise<PaginatedResultDto<CompanyMember>> {
    return createPaginatedResult(this.companyMemberRepository, paginationOptions, {
      where: { companyId },
      relations: ['user'],
    });
  }

  async getCompanyMembersCount(companyId: string): Promise<number> {
    return this.companyMemberRepository.count({ where: { companyId } });
  }

  async getMemberRoleBySlug(userId: string, slug: string) {
    const member = await this.companyMemberRepository.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
    });

    return {
      role: member?.role || null,
      companyId: member?.company?.id || null,
    };
  }
}
