import { UserRole } from '@/common/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface Auth0Payload extends JwtPayload {
  iss: string;
  aud: string | string[];
}
