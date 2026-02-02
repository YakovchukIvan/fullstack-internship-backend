import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { AuthCredentialsService } from '@/modules/auth/services/auth-credentials.service';
import { normalizeEmail } from '@/common/helpers/normalize-email.helper';
import { AppLogger } from '@/common/logger/app-logger';
import { UserRole } from '../../common/enums/user-role.enum';
import { PaginatedResult } from '@/common/interfaces/paginated-result.interface';
import { createPaginatedResult } from '@/common/helpers/create-paginated-result.helper';
import { UsersPaginationQueryDto } from './dto/req/users-pagination-query.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly dataSource: DataSource,
    private readonly authCredentialsService: AuthCredentialsService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(UsersService.name);
  }

  async create(createUserDto: CreateUserDto): Promise<User> {
    const normalizedEmail = normalizeEmail(createUserDto.email);

    return this.dataSource.transaction(async (manager) => {
      const createdUser = manager.create(User, {
        email: normalizedEmail,
        firstName: createUserDto.firstName,
        lastName: createUserDto.lastName,
        role: UserRole.USER,
      });

      const user = await manager.save(User, createdUser);
      await this.authCredentialsService.createForUser(manager, user, createUserDto.password);

      this.logger.log({ userId: user.id, email: user.email }, 'User created successfully');
      return user;
    });
  }

  async findAll(paginationQuery: UsersPaginationQueryDto): Promise<PaginatedResult<User>> {
    const result = await createPaginatedResult(this.usersRepository, {
      page: paginationQuery.page,
      limit: paginationQuery.limit,
      sortBy: paginationQuery.sortBy,
      order: paginationQuery.order,
    });

    this.logger.log('Users fetched successfully');
    return result;
  }

  async findOne(id: string): Promise<User> {
    const user = await this.findUserByIdOrThrow(id);

    this.logger.log({ userId: id }, 'Fetching user by ID');
    return user;
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
      if (dto.password) {
        this.logger.log({ userId: id }, 'Updating user password');
        await this.authCredentialsService.setPasswordTx(manager, user, dto.password);
      }

      const updatedUser = await userRepo.save(user);

      this.logger.log({ userId: updatedUser.id, email: updatedUser.email }, 'User updated successfully');
      return updatedUser;
    });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findUserByIdOrThrow(id);
    await this.usersRepository.softDelete(user.id);

    this.logger.log({ userId: id, email: user.email }, 'User removed successfully');
  }

  private async findUserByIdOrThrow(
    id: string,
    relations: string[] = [],
    repo: Repository<User> = this.usersRepository,
  ): Promise<User> {
    const user = await repo.findOne({ where: { id }, relations });

    if (!user) {
      this.logger.warn({ userId: id }, 'User not found');
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return user;
  }
}
