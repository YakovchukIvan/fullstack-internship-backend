import { Injectable, CanActivate, ExecutionContext, ForbiddenException, NotFoundException } from '@nestjs/common';
import { UserRole } from '@/common/enums/user-role.enum';
import { RequestWithUser } from '@/modules/auth/interfaces/request-with-user.interface';
import { CompaniesService } from '../companies.service';

@Injectable()
export class CompanyOwnerGuard implements CanActivate {
  constructor(private readonly companiesService: CompaniesService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithUser & { params: { id?: string } }>();

    const user = request.user;
    const companyId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === UserRole.OWNER) {
      return true;
    }

    if (!companyId) {
      throw new ForbiddenException('Company ID is required');
    }

    const company = await this.companiesService.findOne(companyId);

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    if (company.ownerId !== user.id) {
      throw new ForbiddenException('You can only modify your own companies');
    }

    return true;
  }
}
