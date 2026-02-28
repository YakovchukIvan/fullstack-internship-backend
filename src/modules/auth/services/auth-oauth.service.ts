import { Injectable } from '@nestjs/common';
import { Auth } from '../entities/auth.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { UserAuthRepository } from '../repositories/user-auth.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { JwtPayload } from '@/common/interfaces/jwt-payload.interface';

type Auth0IncomingPayload = Omit<JwtPayload, 'role'>;

@Injectable()
export class AuthOAuthService {
  constructor(
    private readonly userAuthRepository: UserAuthRepository,
    private readonly authRepository: AuthRepository,
  ) {}

  async validateAuth0User(auth0Payload: Auth0IncomingPayload): Promise<{ id: string; email: string; role: UserRole }> {
    const email = auth0Payload.email.toLowerCase();
    const user = await this.userAuthRepository.findByEmailSelect(email);

    if (!user) {
      return this.createUserFromAuth0(auth0Payload);
    }

    return { id: user.id, email: user.email, role: user.role };
  }

  private async createUserFromAuth0(
    auth0Payload: Auth0IncomingPayload,
  ): Promise<{ id: string; email: string; role: UserRole }> {
    const email = auth0Payload.email.toLowerCase();

    const existing = await this.userAuthRepository.findByEmail(email);
    GuardAssertions.notExists(existing, 'User with this email already exists');

    const [firstName = 'User', lastName = 'Auth0'] = this.parseNameFromEmail(email);

    const user = this.userAuthRepository.create({
      email,
      firstName,
      lastName,
      role: UserRole.USER,
    });

    const savedUser = await this.userAuthRepository.save(user);

    const auth = this.authRepository.create({
      user: savedUser,
      passwordHash: null,
      googleId: auth0Payload.sub,
    } as Partial<Auth>);

    await this.authRepository.save(auth);

    return { id: savedUser.id, email: savedUser.email, role: savedUser.role };
  }

  private parseNameFromEmail(email: string): [string, string] {
    const username = email.split('@')[0];
    const parts = username.split(/[._-]/);

    if (parts.length >= 2) {
      return [this.capitalize(parts[0]), this.capitalize(parts[1])];
    }

    return [this.capitalize(username), 'User'];
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
