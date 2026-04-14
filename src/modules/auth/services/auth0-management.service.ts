import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppLogger } from '@/common/logger/app-logger';

interface Auth0ManagementToken {
  access_token: string;
  expires_at: number;
}

@Injectable()
export class Auth0ManagementService {
  private readonly domain: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly audience: string;

  private cachedToken: Auth0ManagementToken | null = null;

  constructor(
    private readonly configService: ConfigService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(Auth0ManagementService.name);
    this.domain = this.configService.getOrThrow<string>('AUTH0_DOMAIN');
    this.clientId = this.configService.getOrThrow<string>('AUTH0_CLIENT_ID');
    this.clientSecret = this.configService.getOrThrow<string>('AUTH0_CLIENT_SECRET');
    this.audience = `https://${this.domain}/api/v2/`;
  }

  async deleteUser(auth0UserId: string): Promise<void> {
    const token = await this.getManagementToken();

    const url = `https://${this.domain}/api/v2/users/${encodeURIComponent(auth0UserId)}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok && response.status !== 204) {
      const body = await response.text();
      this.logger.error({ auth0UserId, status: response.status, body }, 'Failed to delete user from Auth0');
      throw new InternalServerErrorException('Failed to delete user from Auth0');
    }

    this.logger.log({ auth0UserId }, 'User deleted from Auth0 successfully');
  }

  async updateUser(
    auth0UserId: string,
    data: { given_name?: string; family_name?: string; name?: string; picture?: string },
  ): Promise<void> {
    const token = await this.getManagementToken();

    const url = `https://${this.domain}/api/v2/users/${encodeURIComponent(auth0UserId)}`;

    const response = await fetch(url, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error({ auth0UserId, status: response.status, body }, 'Failed to update user in Auth0');
      throw new InternalServerErrorException('Failed to update user in Auth0');
    }

    this.logger.log({ auth0UserId, data }, 'User updated in Auth0 successfully');
  }

  private async getManagementToken(): Promise<string> {
    const now = Date.now();

    if (this.cachedToken && now < this.cachedToken.expires_at) {
      return this.cachedToken.access_token;
    }

    const response = await fetch(`https://${this.domain}/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        grant_type: 'client_credentials',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        audience: this.audience,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error({ status: response.status, body }, 'Failed to obtain Auth0 Management token');
      throw new InternalServerErrorException('Failed to obtain Auth0 Management API token');
    }

    const data = (await response.json()) as { access_token: string; expires_in: number };

    this.cachedToken = {
      access_token: data.access_token,
      expires_at: now + (data.expires_in - 60) * 1000,
    };

    this.logger.log('Auth0 Management token obtained and cached');
    return this.cachedToken.access_token;
  }
}
