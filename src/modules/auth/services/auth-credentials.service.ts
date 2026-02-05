import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Auth } from '../entities/auth.entity';
import { User } from '@/modules/users/entities/user.entity';
import { PasswordService } from './password.service';

@Injectable()
export class AuthCredentialsService {
  constructor(
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly passwordService: PasswordService,
  ) {}

  async createForUser(manager: EntityManager, user: User, plainPassword: string): Promise<Auth> {
    const authRepo = manager.getRepository(Auth);
    const passwordHash = await this.passwordService.hash(plainPassword);

    const auth = authRepo.create({ user, passwordHash });
    return authRepo.save(auth);
  }

  async setPassword(user: User, plainPassword: string): Promise<Auth> {
    return this.upsertPassword(this.authRepository, user, plainPassword);
  }

  async setPasswordTx(manager: EntityManager, user: User, plainPassword: string): Promise<Auth> {
    const authRepo = manager.getRepository(Auth);
    return this.upsertPassword(authRepo, user, plainPassword);
  }

  private async upsertPassword(authRepo: Repository<Auth>, user: User, plainPassword: string): Promise<Auth> {
    const passwordHash = await this.passwordService.hash(plainPassword);

    if (user.auth) {
      user.auth.passwordHash = passwordHash;
      return authRepo.save(user.auth);
    }

    const auth = authRepo.create({ user, passwordHash });
    return authRepo.save(auth);
  }
}
