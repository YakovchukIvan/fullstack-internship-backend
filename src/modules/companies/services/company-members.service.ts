import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { EntityManager } from 'typeorm';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyMembersPaginationDto } from '../dto/req/members/company-members-pagination.req.dto';
import { CompanyMember } from '../entities/company-member.entity';
import { CompanyMemberRepository } from '../repositories/company-member.repository';
import { GuardAssertions } from '@/common/helpers/assert.helper';

@Injectable()
export class CompanyMembersService {
  constructor(private readonly companyMemberRepository: CompanyMemberRepository) {}

  async createInitialOwner(userId: string, companyId: string, manager?: EntityManager): Promise<CompanyMember> {
    return this.addMember(userId, companyId, CompanyRole.OWNER, manager);
  }

  async addMember(
    userId: string,
    companyId: string,
    role: CompanyRole,
    manager?: EntityManager,
  ): Promise<CompanyMember> {
    const repo = manager ? manager.getRepository(CompanyMember) : this.companyMemberRepository;
    const member = repo.create({ userId, companyId, role });
    const saved = await repo.save(member);
    return repo.findOneOrFail({ where: { id: saved.id }, relations: ['user'] });
  }

  async removeMember(slug: string, memberId: string, removedById: string): Promise<void> {
    const member = await this.companyMemberRepository.findMemberBySlugOrFail(slug, memberId);

    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot remove owner');
    }

    const removerRole = await this.companyMemberRepository.getUserRoleInCompany(removedById, member.company.id);

    if (removerRole === CompanyRole.ADMIN && member.role === CompanyRole.ADMIN) {
      throw new ForbiddenException('Admins cannot remove other admins');
    }

    await this.companyMemberRepository.remove(member);
  }

  async leaveCompany(slug: string, userId: string): Promise<void> {
    const member = await this.companyMemberRepository.findBySlugAndUserOrFail(slug, userId);
    GuardAssertions.isTrueForbidden(member.role !== CompanyRole.OWNER, 'Owner cannot leave. Delete company instead.');
    await this.companyMemberRepository.remove(member);
  }

  async updateMemberRole(slug: string, memberId: string, newRole: CompanyRole): Promise<CompanyMember> {
    const member = await this.companyMemberRepository.findMemberBySlugOrFail(slug, memberId);

    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot change owner role');
    }
    if (newRole === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot change role to owner');
    }
    if (member.role === newRole) {
      throw new ConflictException('User already has this role');
    }

    member.role = newRole;
    return this.companyMemberRepository.save(member);
  }

  async isMember(userId: string, companyId: string): Promise<boolean> {
    return this.companyMemberRepository.isMember(userId, companyId);
  }

  async findCompanyMembers(
    companyId: string,
    dto: CompanyMembersPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyMember>> {
    return this.companyMemberRepository.findPaginatedByCompany(companyId, dto);
  }

  async findMembershipBySlug(userId: string, slug: string): Promise<CompanyMember | null> {
    return this.companyMemberRepository.findMembershipBySlug(userId, slug);
  }

  async getUserMembership(
    userId: string,
    dto: CompanyMembersPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyMember>> {
    return this.companyMemberRepository.findPaginatedByUser(userId, dto);
  }
}
