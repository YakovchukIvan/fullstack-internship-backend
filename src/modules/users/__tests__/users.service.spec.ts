import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UsersService } from '../users.service';
import { UserRepository } from '../repositories/user.repository';
import { AuthCredentialsService } from '@/modules/auth/services/auth-credentials.service';
import { AppLogger } from '@/common/logger/app-logger';
import { S3Service } from '@/modules/s3/s3.service';
import { User } from '../entities/user.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { UpdateUserDto } from '../dto/req/update-user.req.dto';

// === Factory functions ===

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-uuid-1',
    email: 'test@example.com',
    firstName: 'Ivan',
    lastName: 'Test',
    role: UserRole.USER,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }) as User;

// === Tests ===

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let authCredentialsService: jest.Mocked<AuthCredentialsService>;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UserRepository,
          useValue: {
            findByIdOrFail: jest.fn(),
            findPaginated: jest.fn(),
            remove: jest.fn(),
          },
        },
        {
          provide: AuthCredentialsService,
          useValue: {
            createForUser: jest.fn(),
            setPasswordTx: jest.fn(),
          },
        },
        // Typed as plain object to avoid DataSource transaction overload conflict
        {
          provide: DataSource,
          useValue: {
            transaction: jest.fn(),
          },
        },
        {
          provide: AppLogger,
          useValue: {
            setLoggerContext: jest.fn(),
            log: jest.fn(),
            logError: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
    authCredentialsService = module.get(AuthCredentialsService);
    dataSource = module.get<{ transaction: jest.Mock }>(DataSource);
  });

  // === findOne ===

  describe('findOne', () => {
    it('should return user by id; throw NotFoundException if not found', async () => {
      const user = makeUser();

      // === Success case ===
      userRepository.findByIdOrFail.mockResolvedValueOnce(user);

      const result = await service.findOne(user.id);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);

      // === User not found ===
      // findByIdOrFail internally calls GuardAssertions.exists which throws NotFoundException

      userRepository.findByIdOrFail.mockRejectedValueOnce(new NotFoundException('User with ID not found'));

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // === update ===

  describe('update', () => {
    it('should update firstName/lastName; call setPasswordTx if password provided', async () => {
      const user = makeUser();

      // === Update name fields ===
      const nameDto: UpdateUserDto = { firstName: 'UpdatedName', lastName: 'UpdatedLastName' };

      // Transaction mock: invoke callback with fake EntityManager
      dataSource.transaction.mockImplementationOnce(async (cb: (manager: EntityManager) => Promise<User>) => {
        const updatedUser = { ...user, ...nameDto };
        const fakeManager = {
          findOneOrFail: jest.fn().mockResolvedValue(user),
          getRepository: jest.fn().mockReturnValue({
            save: jest.fn().mockResolvedValue(updatedUser),
          }),
        } as unknown as EntityManager;
        return cb(fakeManager);
      });

      const nameResult = await service.update(user.id, nameDto);

      expect(nameResult.firstName).toBe('UpdatedName');
      expect(nameResult.lastName).toBe('UpdatedLastName');
      // Password was not provided — setPasswordTx must not be called
      expect(authCredentialsService.setPasswordTx).not.toHaveBeenCalled();

      // === Update with password ===
      const passwordDto: UpdateUserDto = { password: 'NewStrongPass123!' };

      dataSource.transaction.mockImplementationOnce(async (cb: (manager: EntityManager) => Promise<User>) => {
        const userWithAuth = { ...user, auth: { passwordHash: 'oldhash' } };
        const fakeManager = {
          findOneOrFail: jest.fn().mockResolvedValue(userWithAuth),
          getRepository: jest.fn().mockReturnValue({
            save: jest.fn().mockResolvedValue(user),
          }),
        } as unknown as EntityManager;
        return cb(fakeManager);
      });

      authCredentialsService.setPasswordTx.mockResolvedValue({ id: 'auth-uuid-1' } as never);

      await service.update(user.id, passwordDto);

      // Password was provided — setPasswordTx must be called once
      expect(authCredentialsService.setPasswordTx).toHaveBeenCalledTimes(1);
    });
  });

  // === remove ===

  describe('remove', () => {
    it('should call userRepository.remove with the found user', async () => {
      const user = makeUser();

      userRepository.findByIdOrFail.mockResolvedValue(user);
      userRepository.remove.mockResolvedValue(user);

      await service.remove(user.id);

      // Ensure the correct user entity is passed to remove
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });
  });
});
