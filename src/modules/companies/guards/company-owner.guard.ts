// src/modules/companies/guards/company-owner.guard.ts
import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@/common/enums/user-role.enum';
import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';
import { CompaniesService } from '../companies.service';

interface RequestWithUserAndParams {
  user: JwtPayload;
  params: { slug?: string };
}

@Injectable()
export class CompanyOwnerGuard implements CanActivate {
  constructor(private readonly companiesService: CompaniesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUserAndParams>();

    const user = request.user;
    const slug = request.params.slug;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === UserRole.OWNER) {
      return true;
    }

    if (!slug) {
      throw new ForbiddenException('Company slug is required');
    }

    const company = await this.companiesService.findBySlug(slug);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const isOwner = await this.companiesService.isCompanyOwner(user.sub, company.id);

    if (!isOwner) {
      throw new ForbiddenException('You can only modify your own companies');
    }

    return true;
  }
}
