import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { CompaniesService } from '../companies.service';
import { CompanyRole } from '@/common/enums/company-role.enum';
import { Reflector } from '@nestjs/core';
import { COMPANY_ROLES_KEY } from '../decorators/company-roles.decorator';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

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
    private readonly companiesService: CompaniesService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.reflector.getAllAndOverride<CompanyRole[]>(COMPANY_ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest<CompanyRequest>();
    const { user, params } = request;
    const slug = params.slug;

    if (!slug) {
      return true;
    }

    if (!user) {
      return false;
    }

    const { role: userRoleInCompany, companyId } = await this.companiesService.getUserRoleInCompanyBySlug(
      user.sub,
      slug,
    );

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
