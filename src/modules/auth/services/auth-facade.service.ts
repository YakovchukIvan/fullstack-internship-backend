import type { Response } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Auth } from '../entities/auth.entity';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { LoginDto } from '../dto/req/login.dto';
import { AuthResponseDto } from '../dto/res/auth-response.dto';
import { toUserResponseDto } from '@/modules/users/mappers/user.mapper';
import { UserRole } from '@/common/enums/user-role.enum';
import { AppLogger } from '@/common/logger/app-logger';
import { MailService } from '@/modules/mail/mail.service';
import { RegisterDto } from '../dto/req/register.dto';
import { UserAuthRepository } from '../repositories/user-auth.repository';
import { AuthRepository } from '../repositories/auth.repository';
import { GuardAssertions } from '@/common/helpers/assert.helper';

interface ForgotPasswordResult {
  resetToken?: string;
  isOAuthUser: boolean;
  provider?: string;
}

@Injectable()
export class AuthFacadeService {
  constructor(
    private readonly userAuthRepository: UserAuthRepository,
    private readonly authRepository: AuthRepository,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(AuthFacadeService.name);
  }

  async handleRegister(registerDto: RegisterDto, response: Response): Promise<AuthResponseDto> {
    const authResponse = await this.register(registerDto);
    this.tokenService.setAuthCookies(response, authResponse.accessToken, authResponse.refreshToken!);
    return authResponse;
  }

  async handleLogin(loginDto: LoginDto, response: Response): Promise<AuthResponseDto> {
    const authResponse = await this.login(loginDto);
    this.tokenService.setAuthCookies(response, authResponse.accessToken, authResponse.refreshToken!);
    return authResponse;
  }

  async handleForgotPassword(email: string): Promise<{ message: string }> {
    const result = await this.forgotPassword(email);

    if (result.isOAuthUser && result.provider) {
      await this.mailService.sendOAuthLoginReminderEmail(email, result.provider);
    } else if (result.resetToken) {
      await this.mailService.sendPasswordResetEmail(email, result.resetToken);
    }

    return { message: 'If an account exists with this email, you will receive instructions shortly' };
  }

  async handleLogout(userId: string, response: Response): Promise<void> {
    this.tokenService.clearAuthCookies(response);
    await this.authRepository.updateRefreshToken(userId, null);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.passwordService.hashResetToken(token);
    const auth = await this.authRepository.findByResetToken(tokenHash);

    GuardAssertions.isTrueBadRequest(!!auth, 'Invalid or expired reset token');
    GuardAssertions.isTrueBadRequest(
      !!auth.resetPasswordExpiresAt && !this.passwordService.isResetTokenExpired(auth.resetPasswordExpiresAt),
      'Reset token has expired',
    );

    auth.passwordHash = await this.passwordService.hash(newPassword);
    auth.resetPasswordTokenHash = null;
    auth.resetPasswordExpiresAt = null;
    auth.refreshTokenHash = null;

    await this.authRepository.save(auth);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userAuthRepository.findByEmailWithAuth(email.toLowerCase());

    if (!user || !user.auth?.passwordHash) {
      return null;
    }

    const isPasswordValid = await this.passwordService.compare(password, user.auth.passwordHash);
    if (!isPasswordValid) {
      return null;
    }

    delete user.auth;
    return user;
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const tokenHash = this.passwordService.hashResetToken(refreshToken);

    const auth = await this.authRepository.findByRefreshToken(tokenHash, payload.sub);
    GuardAssertions.isTrueBadRequest(!!auth, 'Invalid refresh token');

    const newAccessToken = this.tokenService.generateAccessToken(auth.user);
    delete auth.user.auth;

    return {
      accessToken: newAccessToken,
      user: toUserResponseDto(auth.user),
      expiresIn: this.tokenService.getTokenExpirationTime(),
    };
  }

  private async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const email = registerDto.email.toLowerCase();

    const existingUser = await this.userAuthRepository.findByEmail(email);
    GuardAssertions.notExists(existingUser, 'User with this email already exists');

    const user = await this.dataSource.transaction(async (manager) => {
      const userRepo = manager.getRepository(User);
      const authRepo = manager.getRepository(Auth);

      const newUser = userRepo.create({
        email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: UserRole.USER,
      });

      const savedUser = await userRepo.save(newUser);
      const passwordHash = await this.passwordService.hash(registerDto.password);
      await authRepo.save(authRepo.create({ user: savedUser, passwordHash }));

      return savedUser;
    });

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);
    await this.authRepository.updateRefreshToken(user.id, this.passwordService.hashResetToken(refreshToken));

    return {
      accessToken,
      refreshToken,
      user: toUserResponseDto(user),
      expiresIn: this.tokenService.getTokenExpirationTime(),
    };
  }

  private async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);
    await this.authRepository.updateRefreshToken(user.id, this.passwordService.hashResetToken(refreshToken));

    return {
      accessToken,
      refreshToken,
      user: toUserResponseDto(user),
      expiresIn: this.tokenService.getTokenExpirationTime(),
    };
  }

  private async forgotPassword(email: string): Promise<ForgotPasswordResult> {
    const normalizedEmail = email.toLowerCase();
    const user = await this.userAuthRepository.findByEmailWithAuth(normalizedEmail);

    if (!user || !user.auth) {
      this.logger.log(`❌ Forgot password: User not found - ${normalizedEmail}`);
      return { isOAuthUser: false };
    }

    if (user.auth.googleId && !user.auth.passwordHash) {
      this.logger.log(`🔐 Forgot password: OAuth user - ${normalizedEmail}`);
      return { isOAuthUser: true, provider: 'Google' };
    }

    if (!user.auth.passwordHash) {
      this.logger.log(`⚠️ Forgot password: No password hash - ${normalizedEmail}`);
      return { isOAuthUser: false };
    }

    const resetToken = this.passwordService.generateResetToken();
    user.auth.resetPasswordTokenHash = this.passwordService.hashResetToken(resetToken);
    user.auth.resetPasswordExpiresAt = this.passwordService.getResetTokenExpiryDate();
    await this.authRepository.save(user.auth);

    this.logger.log(`✅ Forgot password: Reset token generated - ${normalizedEmail}`);
    return { resetToken, isOAuthUser: false };
  }
}
