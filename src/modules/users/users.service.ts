import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { normalizeEmail } from '@/common/helpers/normalize-email.helper';
import { AuthCredentialsService } from '../auth/services/auth-credentials.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly authCredentialsService: AuthCredentialsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    createUserDto.email = this.normalizedEmail(createUserDto.email);

    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: createUserDto.email,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
      });

      const savedUser = await manager.save(User, user);

      await this.authCredentialsService.createForUser(manager, savedUser, createUserDto.password);

      return savedUser;
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    return this.findUserByIdOrFail(id);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserByIdOrFail(id, ['auth']);

    if (updateUserDto.email !== undefined) {
      updateUserDto.email = normalizeEmail(updateUserDto.email);
    }

    Object.assign(user, {
      ...(updateUserDto.email && { email: updateUserDto.email }),
      ...(updateUserDto.firstName && { firstName: updateUserDto.firstName }),
      ...(updateUserDto.lastName && { lastName: updateUserDto.lastName }),
      ...(updateUserDto.role && { role: updateUserDto.role }),
    });

    if (updateUserDto.password) {
      await this.authCredentialsService.setPassword(user, updateUserDto.password);
    }

    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findUserByIdOrFail(id);
    await this.usersRepository.softDelete(user.id);
  }

  // Private Helper Methods

  private normalizedEmail(email: string): string {
    return normalizeEmail(email);
  }

  private async findUserByIdOrFail(id: string, relations: string[] = []): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
      relations,
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
