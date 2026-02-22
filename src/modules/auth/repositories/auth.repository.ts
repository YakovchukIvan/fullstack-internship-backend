import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { Auth } from '../entities/auth.entity';

@Injectable()
export class AuthRepository extends Repository<Auth> {
  constructor(dataSource: DataSource) {
    super(Auth, dataSource.createEntityManager());
  }

  async findByResetToken(tokenHash: string): Promise<Auth | null> {
    return this.findOne({
      where: { resetPasswordTokenHash: tokenHash },
      relations: ['user'],
    });
  }

  async findByRefreshToken(tokenHash: string, userId: string): Promise<Auth | null> {
    return this.findOne({
      where: { refreshTokenHash: tokenHash, user: { id: userId } },
      relations: ['user'],
    });
  }

  async updateRefreshToken(userId: string, hash: string | null): Promise<void> {
    await this.update({ user: { id: userId } }, { refreshTokenHash: hash });
  }
}
