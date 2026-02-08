import type { Response } from 'express';
import { Body, Controller, Get, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/req/login.dto';
import { AuthResponseDto } from './dto/res/auth-response.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UniversalAuthGuard } from './guards/universal-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { toUserResponseDto } from '../users/mappers/user.mapper';
import { UserResponseDto } from '../users/dto/res/user.res.dto';
import { AuthRoutes } from './routes/auth.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { RegisterDto } from './dto/req/register.dto';
import { ApiSecurity } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/req/forgot-password.dto';
import { ResetPasswordDto } from './dto/req/reset-password.dto';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';

@Controller(AuthRoutes.ROOT)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(AuthRoutes.REGISTER)
  @ApiSecurity({})
  @ApiEndpoint(AuthResponseDto, HttpStatus.CREATED)
  @ResponseMessage('User registered successfully')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.authService.handleRegister(registerDto, response);
  }

  @Post(AuthRoutes.LOGIN)
  @ApiSecurity({})
  @ApiEndpoint(AuthResponseDto, HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  @ResponseMessage('Login successful')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
    return this.authService.handleLogin(loginDto, response);
  }

  @Post(AuthRoutes.FORGOT_PASSWORD)
  @ApiSecurity({})
  @ApiEndpoint(Object, HttpStatus.OK)
  @ResponseMessage('Password reset request processed')
  async forgotPassword(@Body() dto: ForgotPasswordDto): Promise<{ message: string }> {
    const result = await this.authService.handleForgotPassword(dto.email);
    return {
      message: result.message,
    };
  }

  @Post(AuthRoutes.RESET_PASSWORD)
  @ApiSecurity({})
  @ApiEndpoint(Object, HttpStatus.OK)
  @ResponseMessage('Password has been reset successfully')
  async resetPassword(@Body() dto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authService.resetPassword(dto.token, dto.newPassword);
    return {
      message: 'You can now login with your new password',
    };
  }

  @Post(AuthRoutes.LOGOUT)
  @UseGuards(UniversalAuthGuard)
  @ResponseMessage('Logout successful')
  async logout(
    @CurrentUser() user: User,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    await this.authService.handleLogout(user.id, response);
    return {
      message: 'You have been logged out successfully',
    };
  }

  @Get(AuthRoutes.ME)
  @ApiEndpoint(UserResponseDto)
  @UseGuards(UniversalAuthGuard)
  @ResponseMessage('Current user fetched')
  getCurrentUser(@CurrentUser() user: User): { user: UserResponseDto } {
    return {
      user: toUserResponseDto(user),
    };
  }
}
