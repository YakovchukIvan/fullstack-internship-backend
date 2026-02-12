import { createParamDecorator, ExecutionContext } from '@nestjs/common';

interface RequestWithCompany extends Request {
  companyId?: string;
}

export const CurrentCompanyId = createParamDecorator((ctx: ExecutionContext): string | undefined => {
  const request = ctx.switchToHttp().getRequest<RequestWithCompany>();
  return request.companyId;
});
