import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { User } from '@/modules/users/entities/user.entity';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): User => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();

  if (!request.user) {
    throw new UnauthorizedException('User not found in request');
  }

  return request.user;
});
