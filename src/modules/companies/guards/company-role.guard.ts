import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';

import { COMPANY_ROLES_KEY } from '../decorators/company-roles.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { UserRole } from '@/common/enums/user-role.enum';
import { CompanyMembersService } from '../services/company-members.service';
import { CompaniesService } from '../services/companies.service';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

interface CompanyRequest extends Request {
  user: JwtPayload;
  params: { slug?: string };
  companyId?: string;
}

@Injectable()
export class CompanyRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly companyMembersService: CompanyMembersService,
    private readonly companiesService: CompaniesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles =
      this.reflector.getAllAndOverride<CompanyRole[]>(COMPANY_ROLES_KEY, [context.getHandler(), context.getClass()]) ??
      null;

    const request = context.switchToHttp().getRequest<CompanyRequest>();
    const user = request.user;
    const slug = request.params?.slug;

    if (!user) {
      return false;
    }

    if (!slug) {
      if (requiredRoles?.length) {
        throw new ForbiddenException('Company identifier (slug) is required');
      }
      return true;
    }

    const membership = await this.companyMembersService.findMembershipBySlug(user.sub, slug);
    const companyId = membership?.company?.id ?? null;
    const roleInCompany = membership?.role ?? null;

    if (user.role === UserRole.OWNER) {
      if (!companyId) {
        const company = await this.companiesService.findBySlug(slug, user.sub, user.role);
        request.companyId = company.id;
      } else {
        request.companyId = companyId;
      }
      return true;
    }

    if (!companyId || !roleInCompany) {
      throw new ForbiddenException('You are not a member of this company');
    }

    request.companyId = companyId;

    if (!requiredRoles?.length) {
      return true;
    }

    if (!requiredRoles.includes(roleInCompany)) {
      throw new ForbiddenException('You do not have the required company permissions');
    }

    return true;
  }
}
