import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { User } from '@/modules/users/entities/user.entity';
import { UserRole } from '@/common/enums/user-role.enum';

interface RequestWithUser extends Request {
  user: User;
  params: {
    id?: string;
  };
}

@Injectable()
export class ResourceOwnerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;
    const resourceId = request.params.id;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    if (user.role === UserRole.OWNER) {
      return true;
    }

    if (user.id !== resourceId) {
      throw new ForbiddenException('You can only modify your own profile');
    }

    return true;
  }
}
