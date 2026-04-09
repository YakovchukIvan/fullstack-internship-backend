import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';

export interface AccessTokenPayload extends JwtPayload {
  jti?: string;
}

export interface RefreshTokenPayload {
  sub: string;
  jti: string;
}
