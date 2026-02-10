import { UserRole } from '@/common/enums/user-role.enum';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface Auth0Payload extends JwtPayload {
  iss: string;
  aud: string | string[];
}
