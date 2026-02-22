import { Injectable } from '@nestjs/common';
import { DataSource, Repository } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';

@Injectable()
export class UserAuthRepository extends Repository<User> {
  constructor(dataSource: DataSource) {
    super(User, dataSource.createEntityManager());
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.findOne({ where: { email } });
  }

  async findByEmailWithAuth(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      relations: ['auth'],
    });
  }

  async findByEmailSelect(email: string): Promise<User | null> {
    return this.findOne({
      where: { email },
      select: ['id', 'email', 'role'],
    });
  }
}
