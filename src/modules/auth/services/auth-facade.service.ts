import type { Response } from 'express';
import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Auth } from '../entities/auth.entity';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { LoginDto } from '../dto/req/login.dto';
import { AuthResponseDto } from '../dto/res/auth-response.dto';
import { toUserResponseDto } from '@/modules/users/mappers/user.mapper';
import { UserRole } from '@/common/enums/user-role.enum';
import { RegisterDto } from '../dto/req/register.dto';
import { AppLogger } from '@/common/logger/app-logger';
import { MailService } from '@/modules/mail/mail.service';

interface ForgotPasswordResult {
  resetToken?: string;
  isOAuthUser: boolean;
  provider?: string;
}

@Injectable()
export class AuthFacadeService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly logger: AppLogger,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly dataSource: DataSource,
    private readonly mailService: MailService,
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

  async handleForgotPassword(email: string): Promise<{ message: string; isOAuthUser: boolean; provider?: string }> {
    const result = await this.forgotPassword(email);

    if (result.isOAuthUser && result.provider) {
      await this.mailService.sendOAuthLoginReminderEmail(email, result.provider);
      return {
        message: `This account uses ${result.provider} Sign In. Please check your email for login instructions.`,
        isOAuthUser: true,
        provider: result.provider,
      };
    }

    if (result.resetToken) {
      await this.mailService.sendPasswordResetEmail(email, result.resetToken);
    }

    return {
      message: 'If an account exists with this email, you will receive instructions shortly',
      isOAuthUser: false,
    };
  }

  async handleLogout(userId: string, response: Response): Promise<void> {
    this.tokenService.clearAuthCookies(response);
    await this.authRepository.update({ user: { id: userId } }, { refreshTokenHash: null });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const tokenHash = this.passwordService.hashResetToken(token);

    const auth = await this.authRepository.findOne({
      where: { resetPasswordTokenHash: tokenHash },
      relations: ['user'],
    });

    if (!auth) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    if (!auth.resetPasswordExpiresAt || this.passwordService.isResetTokenExpired(auth.resetPasswordExpiresAt)) {
      throw new BadRequestException('Reset token has expired');
    }

    const passwordHash = await this.passwordService.hash(newPassword);
    auth.passwordHash = passwordHash;
    auth.resetPasswordTokenHash = null;
    auth.resetPasswordExpiresAt = null;
    auth.refreshTokenHash = null;

    await this.authRepository.save(auth);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email: email.toLowerCase() },
      relations: ['auth'],
    });

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

  private async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const email = registerDto.email.toLowerCase();

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const user = await this.dataSource.transaction(async (manager) => {
      const newUser = manager.getRepository(User).create({
        email,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
        role: UserRole.USER,
      });

      const savedUser = await manager.getRepository(User).save(newUser);

      const passwordHash = await this.passwordService.hash(registerDto.password);
      const auth = manager.getRepository(Auth).create({
        user: savedUser,
        passwordHash,
      });

      await manager.getRepository(Auth).save(auth);

      return savedUser;
    });

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    const refreshTokenHash = this.passwordService.hashResetToken(refreshToken);
    await this.authRepository.update({ user: { id: user.id } }, { refreshTokenHash });

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

    const refreshTokenHash = this.passwordService.hashResetToken(refreshToken);
    await this.authRepository.update({ user: { id: user.id } }, { refreshTokenHash });

    return {
      accessToken,
      refreshToken,
      user: toUserResponseDto(user),
      expiresIn: this.tokenService.getTokenExpirationTime(),
    };
  }

  private async forgotPassword(email: string): Promise<ForgotPasswordResult> {
    const normalizedEmail = email.toLowerCase();

    const resetToken = this.passwordService.generateResetToken();
    const resetTokenHash = this.passwordService.hashResetToken(resetToken);
    const expiresAt = this.passwordService.getResetTokenExpiryDate();

    const user = await this.userRepository.findOne({
      where: { email: normalizedEmail },
      relations: ['auth'],
    });

    if (!user || !user.auth) {
      this.logger.log(`❌ Forgot password: User not found - ${normalizedEmail}`, AuthFacadeService.name);
      return { isOAuthUser: false };
    }

    if (user.auth.googleId && !user.auth.passwordHash) {
      this.logger.log(
        `🔐 Forgot password: OAuth user detected - ${normalizedEmail} (${user.auth.googleId})`,
        AuthFacadeService.name,
      );
      return {
        isOAuthUser: true,
        provider: 'Google',
      };
    }

    if (!user.auth.passwordHash) {
      this.logger.log(`⚠️ Forgot password: No password hash found - ${normalizedEmail}`, AuthFacadeService.name);
      return { isOAuthUser: false };
    }

    user.auth.resetPasswordTokenHash = resetTokenHash;
    user.auth.resetPasswordExpiresAt = expiresAt;
    await this.authRepository.save(user.auth);

    this.logger.log(`✅ Forgot password: Reset token generated for - ${normalizedEmail}`, AuthFacadeService.name);

    return {
      resetToken,
      isOAuthUser: false,
    };
  }

  async refreshAccessToken(refreshToken: string): Promise<AuthResponseDto> {
    const payload = await this.tokenService.verifyRefreshToken(refreshToken);
    const refreshTokenHash = this.passwordService.hashResetToken(refreshToken);

    const auth = await this.authRepository.findOne({
      where: {
        refreshTokenHash,
        user: { id: payload.sub },
      },
      relations: ['user'],
    });

    if (!auth) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const newAccessToken = this.tokenService.generateAccessToken(auth.user);
    delete auth.user.auth;
    return {
      accessToken: newAccessToken,
      user: toUserResponseDto(auth.user),
      expiresIn: this.tokenService.getTokenExpirationTime(),
    };
  }
}
