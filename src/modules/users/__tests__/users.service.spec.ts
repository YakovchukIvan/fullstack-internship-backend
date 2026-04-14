import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { UsersService } from '../users.service';
import { UserRepository } from '../repositories/user.repository';
import { AuthCredentialsService } from '@/modules/auth/services/auth-credentials.service';
import { AppLogger } from '@/common/logger/app-logger';
import { S3Service } from '@/modules/s3/s3.service';
import { User } from '../entities/user.entity';
import { Auth } from '@/modules/auth/entities/auth.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { UpdateUserDto } from '../dto/req/update-user.req.dto';
import { TokenRedisRepository } from '@/modules/auth/repositories/token-redis.repository';
import { AuthRepository } from '@/modules/auth/repositories/auth.repository';
import { Auth0ManagementService } from '@/modules/auth/services/auth0-management.service';

// === Factory functions ===

const makeUser = (overrides: Partial<User> = {}): User =>
  ({
    id: 'user-uuid-1',
    email: 'test@example.com',
    firstName: 'Ivan',
    lastName: 'Test',
    role: UserRole.USER,
    avatarUrl: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }) as User;

// Auth record for a regular email/password user (no googleId)
const makeLocalAuth = (overrides: Partial<Auth> = {}): Auth =>
  ({
    id: 'auth-uuid-1',
    userId: 'user-uuid-1',
    passwordHash: 'hashed-password',
    googleId: null,
    resetPasswordTokenHash: null,
    resetPasswordExpiresAt: null,
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
    ...overrides,
  }) as Auth;

// Auth record for an Auth0 OAuth user (has googleId, no passwordHash)
const makeOAuthAuth = (overrides: Partial<Auth> = {}): Auth =>
  makeLocalAuth({ passwordHash: null, googleId: 'google-oauth2|123456', ...overrides });

// === Tests ===

describe('UsersService', () => {
  let service: UsersService;
  let userRepository: jest.Mocked<UserRepository>;
  let authCredentialsService: jest.Mocked<AuthCredentialsService>;
  let s3Service: jest.Mocked<S3Service>;
  let dataSource: { transaction: jest.Mock };
  let tokenRedisRepository: jest.Mocked<TokenRedisRepository>;
  let authRepository: jest.Mocked<AuthRepository>;
  let auth0ManagementService: jest.Mocked<Auth0ManagementService>;

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
            save: jest.fn(),
          },
        },
        {
          provide: AuthCredentialsService,
          useValue: {
            createForUser: jest.fn(),
            setPasswordTx: jest.fn(),
          },
        },
        {
          provide: DataSource,
          useValue: { transaction: jest.fn() },
        },
        {
          provide: AppLogger,
          useValue: {
            setLoggerContext: jest.fn(),
            log: jest.fn(),
            error: jest.fn(),
          },
        },
        {
          provide: S3Service,
          useValue: {
            uploadFile: jest.fn(),
            deleteFile: jest.fn(),
          },
        },
        {
          provide: TokenRedisRepository,
          useValue: { revokeAllUserTokens: jest.fn() },
        },
        {
          provide: AuthRepository,
          useValue: { findByUserId: jest.fn() },
        },
        {
          provide: Auth0ManagementService,
          useValue: {
            deleteUser: jest.fn(),
            updateUser: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    userRepository = module.get(UserRepository);
    authCredentialsService = module.get(AuthCredentialsService);
    s3Service = module.get(S3Service);
    dataSource = module.get<{ transaction: jest.Mock }>(DataSource);
    tokenRedisRepository = module.get(TokenRedisRepository);
    authRepository = module.get(AuthRepository);
    auth0ManagementService = module.get(Auth0ManagementService);
  });

  // === findOne ===

  describe('findOne', () => {
    it('should return user by id', async () => {
      const user = makeUser();
      userRepository.findByIdOrFail.mockResolvedValueOnce(user);

      const result = await service.findOne(user.id);

      expect(result.id).toBe(user.id);
      expect(result.email).toBe(user.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      userRepository.findByIdOrFail.mockRejectedValueOnce(new NotFoundException('User with ID not found'));

      await expect(service.findOne('nonexistent-id')).rejects.toThrow(NotFoundException);
    });
  });

  // === update ===

  describe('update', () => {
    const mockTransaction = (updatedUser: User): void => {
      dataSource.transaction.mockImplementationOnce(async (cb: (manager: EntityManager) => Promise<User>) => {
        const fakeManager = {
          findOneOrFail: jest.fn().mockResolvedValue(updatedUser),
          getRepository: jest.fn().mockReturnValue({
            save: jest.fn().mockResolvedValue(updatedUser),
          }),
        } as unknown as EntityManager;
        return cb(fakeManager);
      });
    };

    it('should update firstName/lastName for a regular user (no Auth0 sync)', async () => {
      const user = makeUser();
      const dto: UpdateUserDto = { firstName: 'Updated', lastName: 'Name' };
      mockTransaction({ ...user, ...dto });

      // Regular user — no googleId
      authRepository.findByUserId.mockResolvedValueOnce(makeLocalAuth());

      const result = await service.update(user.id, dto);

      expect(result.firstName).toBe('Updated');
      expect(result.lastName).toBe('Name');
      expect(authCredentialsService.setPasswordTx).not.toHaveBeenCalled();
      // No Auth0 sync for local user
      expect(auth0ManagementService.updateUser).not.toHaveBeenCalled();
    });

    it('should sync name to Auth0 when updating an OAuth user', async () => {
      const user = makeUser();
      const dto: UpdateUserDto = { firstName: 'UpdatedName', lastName: 'UpdatedLastName' };
      const updatedUser = { ...user, ...dto };
      mockTransaction(updatedUser);

      // Auth0 user — has googleId
      authRepository.findByUserId.mockResolvedValueOnce(makeOAuthAuth());
      // Called inside syncNameToAuth0IfOAuthUser to read current names
      userRepository.findByIdOrFail.mockResolvedValueOnce(updatedUser);

      const result = await service.update(user.id, dto);

      expect(result.firstName).toBe('UpdatedName');
      expect(auth0ManagementService.updateUser).toHaveBeenCalledWith(
        'google-oauth2|123456',
        expect.objectContaining({
          given_name: 'UpdatedName',
          family_name: 'UpdatedLastName',
        }),
      );
    });

    it('should call setPasswordTx when password is provided', async () => {
      const user = makeUser();
      const dto: UpdateUserDto = { password: 'NewStrongPass123!' };
      const userWithAuth = { ...user, auth: { passwordHash: 'oldhash' } };

      dataSource.transaction.mockImplementationOnce(async (cb: (manager: EntityManager) => Promise<User>) => {
        const fakeManager = {
          findOneOrFail: jest.fn().mockResolvedValue(userWithAuth),
          getRepository: jest.fn().mockReturnValue({
            save: jest.fn().mockResolvedValue(user),
          }),
        } as unknown as EntityManager;
        return cb(fakeManager);
      });

      authCredentialsService.setPasswordTx.mockResolvedValue(makeLocalAuth());

      await service.update(user.id, dto);

      expect(authCredentialsService.setPasswordTx).toHaveBeenCalledTimes(1);
      expect(authRepository.findByUserId).not.toHaveBeenCalled();
    });
  });

  // === updateAvatar ===

  describe('updateAvatar', () => {
    const fakeFile = { originalname: 'avatar.jpg', buffer: Buffer.from('') } as Express.Multer.File;
    const newAvatarUrl = 'https://s3.example.com/users/avatar.jpg';

    it('should upload new avatar, delete old one, and return updated user', async () => {
      const user = makeUser({ avatarUrl: 'https://s3.example.com/users/old.jpg' });
      userRepository.findByIdOrFail.mockResolvedValueOnce(user);
      s3Service.uploadFile.mockResolvedValueOnce(newAvatarUrl);
      userRepository.save.mockResolvedValueOnce({ ...user, avatarUrl: newAvatarUrl });

      // Local user — no Auth0 sync
      authRepository.findByUserId.mockResolvedValueOnce(makeLocalAuth());

      const result = await service.updateAvatar(user.id, fakeFile);

      expect(s3Service.uploadFile).toHaveBeenCalledWith(fakeFile, 'users');
      expect(s3Service.deleteFile).toHaveBeenCalledWith('https://s3.example.com/users/old.jpg');
      expect(result.avatarUrl).toBe(newAvatarUrl);
      expect(auth0ManagementService.updateUser).not.toHaveBeenCalled();
    });

    it('should sync avatar (picture) to Auth0 for an OAuth user', async () => {
      const user = makeUser({ avatarUrl: null });
      userRepository.findByIdOrFail.mockResolvedValueOnce(user);
      s3Service.uploadFile.mockResolvedValueOnce(newAvatarUrl);
      userRepository.save.mockResolvedValueOnce({ ...user, avatarUrl: newAvatarUrl });

      // OAuth user — has googleId
      authRepository.findByUserId.mockResolvedValueOnce(makeOAuthAuth());

      const result = await service.updateAvatar(user.id, fakeFile);

      expect(result.avatarUrl).toBe(newAvatarUrl);
      expect(auth0ManagementService.updateUser).toHaveBeenCalledWith(
        'google-oauth2|123456',
        expect.objectContaining({ picture: newAvatarUrl }),
      );
    });

    it('should not delete old avatar from S3 if user had no avatar', async () => {
      const user = makeUser({ avatarUrl: null });
      userRepository.findByIdOrFail.mockResolvedValueOnce(user);
      s3Service.uploadFile.mockResolvedValueOnce(newAvatarUrl);
      userRepository.save.mockResolvedValueOnce({ ...user, avatarUrl: newAvatarUrl });
      authRepository.findByUserId.mockResolvedValueOnce(makeLocalAuth());

      await service.updateAvatar(user.id, fakeFile);

      // No old avatar — deleteFile must not be called
      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });

  // === remove ===

  describe('remove', () => {
    it('should revoke tokens, remove user and avatar from S3, skip Auth0 for regular user', async () => {
      const user = makeUser({ avatarUrl: 'https://s3.example.com/users/avatar.jpg' });
      userRepository.findByIdOrFail.mockResolvedValueOnce(user);
      userRepository.remove.mockResolvedValueOnce(user);
      // Regular user — no googleId
      authRepository.findByUserId.mockResolvedValueOnce(makeLocalAuth());

      await service.remove(user.id);

      expect(tokenRedisRepository.revokeAllUserTokens).toHaveBeenCalledWith(user.id);
      expect(s3Service.deleteFile).toHaveBeenCalledWith(user.avatarUrl);
      expect(auth0ManagementService.deleteUser).not.toHaveBeenCalled();
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });

    it('should delete user from Auth0 when removing an OAuth user', async () => {
      const user = makeUser();
      userRepository.findByIdOrFail.mockResolvedValueOnce(user);
      userRepository.remove.mockResolvedValueOnce(user);
      // OAuth user — has googleId
      authRepository.findByUserId.mockResolvedValueOnce(makeOAuthAuth());

      await service.remove(user.id);

      expect(tokenRedisRepository.revokeAllUserTokens).toHaveBeenCalledWith(user.id);
      expect(auth0ManagementService.deleteUser).toHaveBeenCalledWith('google-oauth2|123456');
      expect(userRepository.remove).toHaveBeenCalledWith(user);
    });

    it('should not delete avatar from S3 if user had no avatar', async () => {
      const user = makeUser({ avatarUrl: null });
      userRepository.findByIdOrFail.mockResolvedValueOnce(user);
      userRepository.remove.mockResolvedValueOnce(user);
      authRepository.findByUserId.mockResolvedValueOnce(makeLocalAuth());

      await service.remove(user.id);

      expect(s3Service.deleteFile).not.toHaveBeenCalled();
    });
  });
});
