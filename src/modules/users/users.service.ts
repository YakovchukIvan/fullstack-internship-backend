import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { AuthCredentialsService } from '@/modules/auth/services/auth-credentials.service';
import { normalizeEmail } from '@/common/helpers/normalize-email.helper';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly authCredentialsService: AuthCredentialsService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const normalizedEmail = normalizeEmail(createUserDto.email);

    return this.dataSource.transaction(async (manager) => {
      const createdUser = manager.create(User, {
        email: normalizedEmail,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: createUserDto.role,
      });

      const user = await manager.save(User, createdUser);
      await this.authCredentialsService.createForUser(manager, user, createUserDto.password);
      return user;
    });
  }

  async findAll(): Promise<User[]> {
    return this.usersRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<User> {
    return this.findUserByIdOrThrow(id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);

      const relations = dto.password ? ['auth'] : [];
      const user = await this.findUserByIdOrThrow(id, relations, userRepo);

      if (dto.email !== undefined) {
        user.email = normalizeEmail(dto.email);
      }
      if (dto.firstName !== undefined) {
        user.firstName = dto.firstName;
      }
      if (dto.lastName !== undefined) {
        user.lastName = dto.lastName;
      }
      if (dto.role !== undefined) {
        user.role = dto.role;
      }
      if (dto.password) {
        await this.authCredentialsService.setPasswordTx(manager, user, dto.password);
      }

      return userRepo.save(user);
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findUserByIdOrThrow(id);
    await this.usersRepository.softDelete(user.id);
  }

  // Private Helper Methods

  private async findUserByIdOrThrow(
    id: string,
    relations: string[] = [],
    repo: Repository<User> = this.usersRepository,
  ): Promise<User> {
    const user = await repo.findOne({ where: { id }, relations });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
