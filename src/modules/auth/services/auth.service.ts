import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { User } from '@/modules/users/entities/user.entity';
import { Auth } from '../entities/auth.entity';
import { PasswordService } from '../password.service';
import { TokenService } from './token.service';
import { LoginDto } from '../dto/login.dto';
import { AuthResponseDto } from '../dto/auth-response.dto';
import { toUserResponseDto } from '@/modules/users/mappers/user.mapper';
import { Auth0Payload } from '../dto/jwt-payload.dto';
import { UserRole } from '@/common/enums/user-role.enum';
import { RegisterDto } from '../dto/req/register.dto';
import { AppLogger } from '@/common/logger/app-logger';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Auth)
    private readonly authRepository: Repository<Auth>,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly dataSource: DataSource,
    private readonly logger: AppLogger,
  ) {
    this.logger.setLoggerContext(AuthService.name);
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const email = registerDto.email.toLowerCase();

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });

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

    return {
      accessToken,
      refreshToken,
      user: toUserResponseDto(user),
      expiresIn: this.tokenService.getTokenExpirationTime(),
    };
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

    return user;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const user = await this.validateUser(loginDto.email, loginDto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      user: toUserResponseDto(user),
      expiresIn: this.tokenService.getTokenExpirationTime(),
    };
  }

  async validateAuth0User(auth0Payload: Auth0Payload): Promise<User> {
    const email = auth0Payload.email.toLowerCase();

    let user = await this.userRepository.findOne({
      where: { email },
      relations: ['auth'],
    });

    if (!user) {
      user = await this.createUserFromAuth0(auth0Payload);
    }

    return user;
  }

  private async createUserFromAuth0(auth0Payload: Auth0Payload): Promise<User> {
    const email = auth0Payload.email.toLowerCase();

    const existingUser = await this.userRepository.findOne({ where: { email } });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const [firstName = 'User', lastName = 'Auth0'] = this.parseNameFromEmail(email);

    const user = this.userRepository.create({
      email,
      firstName,
      lastName,
      role: UserRole.USER,
    });

    await this.userRepository.save(user);

    const auth = this.authRepository.create({
      user,
      passwordHash: null,
      googleId: auth0Payload.sub,
    });

    await this.authRepository.save(auth);

    return user;
  }

  private parseNameFromEmail(email: string): [string, string] {
    const username = email.split('@')[0];
    const parts = username.split(/[._-]/);

    if (parts.length >= 2) {
      return [this.capitalize(parts[0]), this.capitalize(parts[1])];
    }

    return [this.capitalize(username), 'User'];
  }

  private capitalize(str: string): string {
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }
}
