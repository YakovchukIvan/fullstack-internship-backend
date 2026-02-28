import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { RequestWithUser } from '../../modules/auth/interfaces/request-with-user.interface';
import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';

export const CurrentUser = createParamDecorator((_data: unknown, ctx: ExecutionContext): JwtPayload => {
  const request = ctx.switchToHttp().getRequest<RequestWithUser>();

  if (!request.user) {
    throw new UnauthorizedException('User not found in request');
  }

  return request.user;
});
