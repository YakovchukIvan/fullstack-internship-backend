import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import { COMPANY_ROLES_KEY } from '../decorators/company-roles.decorator';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { UserRole } from '@/common/enums/user-role.enum';
import { CompanyMembersService } from '../services/company-members.service';
import { JwtPayload } from '@/common/interface/jwt-payload.interface';

interface CompanyRequest extends Request {
  user: JwtPayload;
  params: { slug: string };
}

@Injectable()
export class CompanyRoleGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly companyMembersService: CompanyMembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<CompanyRole[]>(COMPANY_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<CompanyRequest>();
    const { user } = request;
    const { slug } = request.params;

    if (user.role === UserRole.OWNER) {
      return true;
    }

    const membership = await this.companyMembersService.findMembershipBySlug(user.sub, slug);

    if (!membership) {
      throw new ForbiddenException('You are not a member of this company');
    }

    if (!requiredRoles) {
      return true;
    }

    if (!requiredRoles.includes(membership.role)) {
      throw new ForbiddenException('You do not have the required company permissions');
    }

    return true;
  }
}
