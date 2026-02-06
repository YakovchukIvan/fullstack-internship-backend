import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Auth } from '../entities/auth.entity';
import { Auth0Payload } from '../interfaces/jwt-payload.interface';
import { UserRole } from '@/common/enums/user-role.enum';

@Injectable()
export class AuthOAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
  ) {}

  async validateAuth0User(auth0Payload: Auth0Payload): Promise<User> {
    const email = auth0Payload.email.toLowerCase();

    let user = await this.userRepository.findOne({
      where: { email },
      relations: ['auth'],
    });

    if (!user) {
      user = await this.createUserFromAuth0(auth0Payload);
    }

    return user;
  }

  private async createUserFromAuth0(auth0Payload: Auth0Payload): Promise<User> {
    const email = auth0Payload.email.toLowerCase();

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const [firstName = 'User', lastName = 'Auth0'] = this.parseNameFromEmail(email);

    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);

    const auth = this.authRepository.create({
      user,
      passwordHash: null,
      googleId: auth0Payload.sub,
    });

    await this.authRepository.save(auth);

    return user;
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
