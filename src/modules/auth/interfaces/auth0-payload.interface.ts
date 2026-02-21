import { JwtPayload } from '@/common/interface/jwt-payload.interface';

export interface Auth0Payload extends JwtPayload {
  iss: string;
  aud: string | string[];
}
