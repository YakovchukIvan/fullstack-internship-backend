import { Injectable, UnauthorizedException } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TokenService } from '@/modules/auth/services/token.service';
import { AccessTokenPayload } from '@/modules/auth/interfaces/token-payload.interface';

@Injectable()
export class NotificationsAuthService {
  constructor(private readonly tokenService: TokenService) {}

  async getUserIdFromSocket(client: Socket): Promise<string> {
    const token = this.extractTokenFromCookie(client);
    const payload: AccessTokenPayload = await this.tokenService.validateAccessToken(token);
    return payload.sub;
  }

  private extractTokenFromCookie(client: Socket): string {
    const cookieHeader = client.handshake.headers.cookie ?? '';
    const match = cookieHeader.match(/access_token=([^;]+)/);

    if (!match?.[1]) {
      throw new UnauthorizedException('No token found');
    }

    return match[1];
  }
}
