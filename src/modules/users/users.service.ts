import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { AuthCredentialsService } from '@/modules/auth/services/auth-credentials.service';
import { AppLogger } from '@/common/logger/app-logger';
import { UserRole } from '@/common/enums/user-role.enum';
import { UsersPaginationQueryDto } from './dto/req/users-pagination-query.req.dto';
import { PaginatedResultResponseDto } from '@/common/dto/res/paginated-result.dto';
import { UserRepository } from './repositories/user.repository';
import { GuardAssertions } from '@/common/helpers/assert.helper';
import { S3Service } from '@/modules/s3/s3.service';

@Injectable()
export class UsersService {
  constructor(
    private readonly userRepository: UserRepository,
    private readonly dataSource: DataSource,
    private readonly authCredentialsService: AuthCredentialsService,
    private readonly logger: AppLogger,
    private readonly s3Service: S3Service,
  ) {
    this.logger.setLoggerContext(UsersService.name);
  }

  async create(dto: CreateUserDto): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const user = manager.create(User, {
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
        role: UserRole.USER,
      });

      const saved = await manager.save(User, user);
      await this.authCredentialsService.createForUser(manager, saved, dto.password);

      this.logger.log({ userId: saved.id, email: saved.email }, 'User created successfully');
      return saved;
    });
  }

  async findAll(dto: UsersPaginationQueryDto): Promise<PaginatedResultResponseDto<User>> {
    const result = await this.userRepository.findPaginated(dto);
    this.logger.log('Users fetched successfully');
    return result;
  }

  async findOne(id: string): Promise<User> {
    this.logger.log({ userId: id }, 'Fetching user by ID');
    return this.userRepository.findByIdOrFail(id);
  }

  async update(id: string, dto: UpdateUserDto): Promise<User> {
    return this.dataSource.transaction(async (manager) => {
      const relations = dto.password ? ['auth'] : [];
      const user = await manager.findOneOrFail(User, { where: { id }, relations });
      GuardAssertions.exists(user, `User with ID ${id} not found`);

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

      const updated = await manager.getRepository(User).save(user);
      this.logger.log({ userId: updated.id }, 'User updated successfully');
      return updated;
    });
  }

  async updateAvatar(userId: string, file: Express.Multer.File): Promise<User> {
    const user = await this.userRepository.findByIdOrFail(userId);
    const oldUrl = user.avatarUrl;

    user.avatarUrl = await this.s3Service.uploadFile(file, 'users');

    const updated = await this.userRepository.save(user);
    this.logger.log({ userId, avatarUrl: updated.avatarUrl }, 'User avatar updated');

    if (oldUrl) {
      await this.s3Service.deleteFile(oldUrl);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const user = await this.userRepository.findByIdOrFail(id);

    if (user.avatarUrl) {
      await this.s3Service.deleteFile(user.avatarUrl);
    }

    await this.userRepository.remove(user);
    this.logger.log({ userId: id, email: user.email }, 'User removed successfully');
  }
}
