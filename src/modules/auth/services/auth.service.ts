import type { Response } from 'express';
import { Injectable } from '@nestjs/common';
import { LoginDto } from '../dto/req/login.dto';
import { AuthResponseDto } from '../dto/res/auth-response.dto';
import { Auth0Payload } from '../interfaces/jwt-payload.interface';
import { RegisterDto } from '../dto/req/register.dto';
import { User } from '@/modules/users/entities/user.entity';
import { AuthFlowService } from './auth-flow.service';
import { AuthOAuthService } from './auth-oauth.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly authFlowService: AuthFlowService,
    private readonly authOAuthService: AuthOAuthService,
  ) {}

  async handleRegister(registerDto: RegisterDto, response: Response): Promise<AuthResponseDto> {
    return this.authFlowService.handleRegister(registerDto, response);
  }

  async handleLogin(loginDto: LoginDto, response: Response): Promise<AuthResponseDto> {
    return this.authFlowService.handleLogin(loginDto, response);
  }

  async handleForgotPassword(email: string): Promise<{ message: string; isOAuthUser: boolean; provider?: string }> {
    return this.authFlowService.handleForgotPassword(email);
  }

  async handleLogout(userId: string, response: Response): Promise<void> {
    return this.authFlowService.handleLogout(userId, response);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    return this.authFlowService.resetPassword(token, newPassword);
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    return this.authFlowService.validateUser(email, password);
  }

  async validateAuth0User(auth0Payload: Auth0Payload): Promise<User> {
    return this.authOAuthService.validateAuth0User(auth0Payload);
  }
}
