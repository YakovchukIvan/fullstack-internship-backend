import { JwtPayload } from '@/common/interface/jwt-payload.interface';
import type { Request } from 'express';

export interface RequestWithUser extends Request {
  user: JwtPayload;
}
