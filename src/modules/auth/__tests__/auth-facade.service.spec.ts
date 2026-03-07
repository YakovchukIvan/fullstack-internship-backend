import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException, BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource, EntityManager } from 'typeorm';
import { Response } from 'express';
import { AuthFacadeService } from '../services/auth-facade.service';
import { PasswordService } from '../services/password.service';
import { TokenService } from '../services/token.service';
import { MailService } from '@/modules/mail/mail.service';
import { UserAuthRepository } from '../repositories/user-auth.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { TokenRedisRepository } from '../repositories/token-redis.repository';
import { AppLogger } from '@/common/logger/app-logger';
import { User } from '@/modules/users/entities/user.entity';
import { Auth } from '../entities/auth.entity';
import { UserRole } from '@/common/enums/user-role.enum';
import { RegisterDto } from '../dto/req/register.dto';
import { LoginDto } from '../dto/req/login.dto';
import { AccessTokenPayload } from '../interfaces/token-payload.interface';

// === Factory functions for test data ===

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

const makeAuth = (overrides: Partial<Auth> = {}): Auth =>
  ({
    id: 'auth-uuid-1',
    userId: 'user-uuid-1',
    passwordHash: '$2b$10$hashedpassword',
    googleId: null,
    resetPasswordTokenHash: null,
    resetPasswordExpiresAt: null,
    ...overrides,
  }) as Auth;

const makeRegisterDto = (overrides: Partial<RegisterDto> = {}): RegisterDto => ({
  email: 'test@example.com',
  firstName: 'Ivan',
  lastName: 'Test',
  password: 'StrongPass123!',
  ...overrides,
});

const makeLoginDto = (overrides: Partial<LoginDto> = {}): LoginDto => ({
  email: 'test@example.com',
  password: 'StrongPass123!',
  ...overrides,
});

const makeTokenPair = () => ({
  accessToken: 'access.jwt.token',
  refreshToken: 'refresh.jwt.token',
  accessJti: 'access-jti-uuid',
  refreshJti: 'refresh-jti-uuid',
});

// Returns a partial Response mock with jest.fn() for cookie methods
const makeResponse = (): jest.Mocked<Pick<Response, 'cookie' | 'clearCookie'>> => ({
  cookie: jest.fn(),
  clearCookie: jest.fn(),
});

// === Tests ===

describe('AuthFacadeService', () => {
  let service: AuthFacadeService;
  let userAuthRepository: jest.Mocked<UserAuthRepository>;
  let tokenRedisRepository: jest.Mocked<TokenRedisRepository>;
  let passwordService: jest.Mocked<PasswordService>;
  let tokenService: jest.Mocked<TokenService>;
  let dataSource: { transaction: jest.Mock };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthFacadeService,
        {
          provide: UserAuthRepository,
          useValue: {
            findByEmail: jest.fn(),
            findByEmailWithAuth: jest.fn(),
            findById: jest.fn(),
          },
        },
        {
          provide: AuthRepository,
          useValue: {
            findByResetToken: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: TokenRedisRepository,
          useValue: {
            saveAccessToken: jest.fn(),
            saveRefreshToken: jest.fn(),
            revokeAccessToken: jest.fn(),
            revokeRefreshToken: jest.fn(),
            revokeAllUserTokens: jest.fn(),
            isRefreshTokenValid: jest.fn(),
          },
        },
        {
          provide: PasswordService,
          useValue: {
            hash: jest.fn(),
            compare: jest.fn(),
            generateResetToken: jest.fn(),
            hashResetToken: jest.fn(),
            getResetTokenExpiryDate: jest.fn(),
            isResetTokenExpired: jest.fn(),
          },
        },
        {
          provide: TokenService,
          useValue: {
            generateAccessToken: jest.fn(),
            generateRefreshToken: jest.fn(),
            verifyRefreshToken: jest.fn(),
            decodeRefreshToken: jest.fn(),
            setAuthCookies: jest.fn(),
            clearAuthCookies: jest.fn(),
            getTokenExpirationTime: jest.fn(),
          },
        },
        {
          provide: MailService,
          useValue: {
            sendPasswordResetEmail: jest.fn(),
            sendOAuthLoginReminderEmail: jest.fn(),
          },
        },
        // DataSource typed as plain object to avoid TypeORM transaction overload conflict
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
      ],
    }).compile();

    service = module.get<AuthFacadeService>(AuthFacadeService);
    userAuthRepository = module.get(UserAuthRepository);
    tokenRedisRepository = module.get(TokenRedisRepository);
    passwordService = module.get(PasswordService);
    tokenService = module.get(TokenService);
    // Get as plain object to keep jest.Mock type and avoid IsolationLevel overload issue
    dataSource = module.get<{ transaction: jest.Mock }>(DataSource);
  });

  // === handleRegister ===

  describe('handleRegister', () => {
    it('should register user and set cookies; throw ConflictException if email already exists', async () => {
      const dto = makeRegisterDto();
      const user = makeUser();
      const tokens = makeTokenPair();
      const response = makeResponse() as unknown as Response;

      // === Success case ===

      userAuthRepository.findByEmail.mockResolvedValueOnce(null);

      // Mock transaction: immediately invoke the callback with a fake EntityManager
      dataSource.transaction.mockImplementationOnce(async (cb: (manager: EntityManager) => Promise<User>) => {
        const fakeManager = {
          getRepository: jest.fn().mockReturnValue({
            create: jest.fn().mockReturnValue(user),
            save: jest.fn().mockResolvedValue(user),
          }),
        } as unknown as EntityManager;
        return cb(fakeManager);
      });

      tokenService.generateAccessToken.mockReturnValue({ token: tokens.accessToken, jti: tokens.accessJti });
      tokenService.generateRefreshToken.mockReturnValue({ token: tokens.refreshToken, jti: tokens.refreshJti });
      tokenService.getTokenExpirationTime.mockReturnValue(3600);
      tokenRedisRepository.saveAccessToken.mockResolvedValue(undefined);
      tokenRedisRepository.saveRefreshToken.mockResolvedValue(undefined);

      const result = await service.handleRegister(dto, response);

      expect(result.accessToken).toBe(tokens.accessToken);
      expect(result.refreshToken).toBe(tokens.refreshToken);
      expect(tokenService.setAuthCookies).toHaveBeenCalledWith(response, tokens.accessToken, tokens.refreshToken);

      // === Email already exists ===

      userAuthRepository.findByEmail.mockResolvedValueOnce(makeUser());

      await expect(service.handleRegister(dto, response)).rejects.toThrow(ConflictException);
    });
  });

  // === handleLogin ===

  describe('handleLogin', () => {
    it('should login user and set cookies; throw UnauthorizedException on wrong password', async () => {
      const dto = makeLoginDto();
      const userWithAuth = { ...makeUser(), auth: makeAuth() } as User & { auth: Auth };
      const tokens = makeTokenPair();
      const response = makeResponse() as unknown as Response;

      // === Success case ===

      userAuthRepository.findByEmailWithAuth.mockResolvedValueOnce(userWithAuth);
      passwordService.compare.mockResolvedValueOnce(true);
      tokenService.generateAccessToken.mockReturnValue({ token: tokens.accessToken, jti: tokens.accessJti });
      tokenService.generateRefreshToken.mockReturnValue({ token: tokens.refreshToken, jti: tokens.refreshJti });
      tokenService.getTokenExpirationTime.mockReturnValue(3600);
      tokenRedisRepository.saveAccessToken.mockResolvedValue(undefined);
      tokenRedisRepository.saveRefreshToken.mockResolvedValue(undefined);

      const result = await service.handleLogin(dto, response);

      expect(result.accessToken).toBe(tokens.accessToken);
      expect(tokenService.setAuthCookies).toHaveBeenCalledWith(response, tokens.accessToken, tokens.refreshToken);

      // === Wrong password ===

      userAuthRepository.findByEmailWithAuth.mockResolvedValueOnce(userWithAuth);
      passwordService.compare.mockResolvedValueOnce(false);

      await expect(service.handleLogin(dto, response)).rejects.toThrow(UnauthorizedException);
    });
  });

  // === handleLogout ===

  describe('handleLogout', () => {
    it('should clear cookies and revoke access token', async () => {
      const user: AccessTokenPayload = {
        sub: 'user-uuid-1',
        email: 'test@example.com',
        role: UserRole.USER,
        jti: 'access-jti-uuid',
      };
      const response = makeResponse() as unknown as Response;

      // No refresh token provided — only access token should be revoked
      tokenService.decodeRefreshToken.mockReturnValue(null);
      tokenRedisRepository.revokeAccessToken.mockResolvedValue(undefined);

      await service.handleLogout(user, undefined, response);

      expect(tokenService.clearAuthCookies).toHaveBeenCalledWith(response);
      expect(tokenRedisRepository.revokeAccessToken).toHaveBeenCalledWith(user.sub, user.jti);
    });
  });

  // === handleRefresh ===

  describe('handleRefresh', () => {
    it('should return new tokens on valid refresh; throw BadRequestException if token is invalid', async () => {
      const user = makeUser();
      const tokens = makeTokenPair();
      const response = makeResponse() as unknown as Response;
      const oldJti = 'old-refresh-jti';

      // === Success case ===

      tokenService.verifyRefreshToken.mockResolvedValueOnce({ sub: user.id, jti: oldJti });
      tokenRedisRepository.isRefreshTokenValid.mockResolvedValueOnce(true);
      tokenRedisRepository.revokeRefreshToken.mockResolvedValue(undefined);
      userAuthRepository.findById.mockResolvedValueOnce(user);
      tokenService.generateAccessToken.mockReturnValue({ token: tokens.accessToken, jti: tokens.accessJti });
      tokenService.generateRefreshToken.mockReturnValue({ token: tokens.refreshToken, jti: tokens.refreshJti });
      tokenService.getTokenExpirationTime.mockReturnValue(3600);
      tokenRedisRepository.saveAccessToken.mockResolvedValue(undefined);
      tokenRedisRepository.saveRefreshToken.mockResolvedValue(undefined);

      const result = await service.handleRefresh('valid-refresh-token', response);

      expect(result.accessToken).toBe(tokens.accessToken);
      expect(result.refreshToken).toBe(tokens.refreshToken);
      // Old refresh token must be revoked before issuing new ones
      expect(tokenRedisRepository.revokeRefreshToken).toHaveBeenCalledWith(user.id, oldJti);
      expect(tokenService.setAuthCookies).toHaveBeenCalledWith(response, tokens.accessToken, tokens.refreshToken);

      // === Invalid token (not found in Redis) ===

      tokenService.verifyRefreshToken.mockResolvedValueOnce({ sub: user.id, jti: 'bad-jti' });
      tokenRedisRepository.isRefreshTokenValid.mockResolvedValueOnce(false);

      await expect(service.handleRefresh('invalid-refresh-token', response)).rejects.toThrow(BadRequestException);
    });
  });

  // === validateUser ===

  describe('validateUser', () => {
    it('should return null if user is not found', async () => {
      // Simulates case when email does not exist in the database
      userAuthRepository.findByEmailWithAuth.mockResolvedValue(null);

      const result = await service.validateUser('notfound@example.com', 'password123');

      expect(result).toBeNull();
    });
  });
});
