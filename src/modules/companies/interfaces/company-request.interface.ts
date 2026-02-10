import { JwtPayload } from '@/modules/auth/interfaces/jwt-payload.interface';

export interface CompanyRequest extends Request {
  user: JwtPayload;
  companyId?: string;
}
