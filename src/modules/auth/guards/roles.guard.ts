import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@/common/enums/user-role.enum';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredRoles) {
      return true;
    }

    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    const hasRole = requiredRoles.some((role) => user.role === role);

    if (hasRole) {
      return true;
    }

    const isUserRoleAllowed = requiredRoles.includes(UserRole.USER);
    const requestWithParams = request as RequestWithUser & { params: { id?: string } };
    const resourceId = requestWithParams.params.id;

    if (isUserRoleAllowed && user.role === UserRole.USER && user.sub === resourceId) {
      return true;
    }

    throw new ForbiddenException('Insufficient permissions');
  }
}
