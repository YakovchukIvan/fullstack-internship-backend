import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, EntityManager } from 'typeorm';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { CompanyMembersPaginationDto } from '../dto/req/members/company-members-pagination.req.dto';
import { CompanyMember } from '../entities/company-member.entity';
import { GuardAssertions } from '@/common/helpers/assert.helper';

@Injectable()
export class CompanyMembersService {
  constructor(
    @InjectRepository(CompanyMember)
    private readonly companyMemberRepository: Repository<CompanyMember>,
  ) {}

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
    const savedMember = await repo.save(member);

    return repo.findOneOrFail({
      where: { id: savedMember.id },
      relations: ['user'],
    });
  }

  async removeMember(slug: string, memberId: string, removedById: string): Promise<void> {
    const member = await this.companyMemberRepository.findOne({
      where: { id: memberId, company: { slug } },
      relations: ['company'],
    });

    GuardAssertions.exists(member, 'Member not found');

    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot remove owner');
    }

    const removerRole = await this.getUserRoleInCompany(removedById, member.company.id);

    if (removerRole === CompanyRole.ADMIN && member.role === CompanyRole.ADMIN) {
      throw new ForbiddenException('Admins cannot remove other admins');
    }

    await this.companyMemberRepository.remove(member);
  }

  async leaveCompany(slug: string, userId: string): Promise<void> {
    const member = await this.companyMemberRepository.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
    });
    GuardAssertions.exists(member, 'Member not found');

    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Owner cannot leave. Delete company instead.');
    }

    await this.companyMemberRepository.remove(member);
  }

  async updateMemberRole(slug: string, memberId: string, newRole: CompanyRole): Promise<CompanyMember> {
    const member = await this.companyMemberRepository.findOne({
      where: { id: memberId, company: { slug } },
      relations: ['company', 'user'],
    });
    GuardAssertions.exists(member, 'Member not found');

    if (member.role === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot change owner role');
    }

    if (newRole === CompanyRole.OWNER) {
      throw new ForbiddenException('Cannot change role to owner. Use ownership transfer instead.');
    }

    if (member.role === newRole) {
      throw new ConflictException('User already has this role');
    }

    member.role = newRole;
    return this.companyMemberRepository.save(member);
  }

  async isMember(userId: string, companyId: string): Promise<boolean> {
    const count = await this.companyMemberRepository.count({ where: { userId, companyId } });
    return count > 0;
  }

  private async getUserRoleInCompany(userId: string, companyId: string): Promise<CompanyRole | null> {
    const member = await this.companyMemberRepository.findOne({
      where: { userId, companyId },
    });
    return member?.role || null;
  }

  async findCompanyMembers(
    companyId: string,
    paginationOptions?: CompanyMembersPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyMember>> {
    return createPaginatedResult(this.companyMemberRepository, paginationOptions, {
      where: { companyId },
      relations: ['user'],
    });
  }

  async findMembershipBySlug(userId: string, slug: string): Promise<CompanyMember | null> {
    return this.companyMemberRepository.findOne({
      where: { userId, company: { slug } },
      relations: ['company'],
      select: {
        id: true,
        role: true,
        company: { id: true },
      },
    });
  }

  async getUserMembership(
    userId: string,
    paginationOptions?: CompanyMembersPaginationDto,
  ): Promise<PaginatedResultResponseDto<CompanyMember>> {
    return createPaginatedResult(this.companyMemberRepository, paginationOptions, {
      where: paginationOptions?.role ? { userId, role: paginationOptions.role } : { userId },
      relations: ['company', 'user'],
    });
  }
}
