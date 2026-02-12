import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { Reflector } from '@nestjs/core';
import { COMPANY_ROLES_KEY } from '../decorators/company-roles.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { UserRole } from '@/common/enums/user-role.enum';
import { CompanyMembersService } from '../services/company-members.service';

interface CompanyRequest extends Request {
  user: JwtPayload;
  params: {
    slug?: string;
  };
  companyId?: string;
}

@Injectable()
export class CompanyRoleGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private readonly companyMembersService: CompanyMembersService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<CompanyRole[]>(COMPANY_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<CompanyRequest>();
    const { user, params } = request;
    const slug = params.slug;

    if (!user) {
      return false;
    }

    if (!slug) {
      return true;
    }

    if (user.role === UserRole.OWNER) {
      return true;
    }

    const { role: userRoleInCompany, companyId } = await this.companyMembersService.getMemberRoleBySlug(user.sub, slug);

    if (!userRoleInCompany || !companyId) {
      throw new ForbiddenException('You are not a member of this company');
    }

    request.companyId = companyId;

    if (!requiredRoles) {
      return true;
    }

    const hasPermission = requiredRoles.includes(userRoleInCompany);

    if (!hasPermission) {
      throw new ForbiddenException('You do not have the required company permissions');
    }

    return true;
  }
}
