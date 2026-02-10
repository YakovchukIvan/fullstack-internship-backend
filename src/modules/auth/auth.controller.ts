import type { Response } from 'express';
import { Body, Controller, Get, HttpStatus, Post, Res, UseGuards } from '@nestjs/common';
import { LoginDto } from './dto/req/login.dto';
import { AuthResponseDto } from './dto/res/auth-response.dto';
import { UniversalAuthGuard } from './guards/universal-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/res/user.res.dto';
import { AuthRoutes } from './routes/auth.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { RegisterDto } from './dto/req/register.dto';
import { ApiSecurity } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/req/forgot-password.dto';
import { ResetPasswordDto } from './dto/req/reset-password.dto';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { AuthFlowService } from './services/auth-flow.service';
import { CurrentUserResponseDto } from './dto/res/current-user.res.dto';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@Controller(AuthRoutes.ROOT)
export class AuthController {
  constructor(private readonly authFlowService: AuthFlowService) {}

  @Post(AuthRoutes.REGISTER)
  @ApiSecurity({})
  @ApiEndpoint(AuthResponseDto, HttpStatus.CREATED)
  @ResponseMessage('User registered successfully')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.authFlowService.handleRegister(registerDto, response);
  }

  @Post(AuthRoutes.LOGIN)
  @ApiSecurity({})
  @ApiEndpoint(AuthResponseDto, HttpStatus.OK)
  @ResponseMessage('Login successful')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
    return this.authFlowService.handleLogin(loginDto, response);
  }

  @Post(AuthRoutes.FORGOT_PASSWORD)
  @ApiSecurity({})
  @ApiEndpoint(Object, HttpStatus.OK)
  @ResponseMessage('Password reset request processed')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const result = await this.authFlowService.handleForgotPassword(forgotPasswordDto.email);
    return {
      message: result.message,
    };
  }

  @Post(AuthRoutes.RESET_PASSWORD)
  @ApiSecurity({})
  @ApiEndpoint(Object, HttpStatus.OK)
  @ResponseMessage('Password has been reset successfully')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authFlowService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return {
      message: 'You can now login with your new password',
    };
  }

  @Post(AuthRoutes.LOGOUT)
  @UseGuards(UniversalAuthGuard)
  @ResponseMessage('Logout successful')
  async logout(
    @CurrentUser() user: JwtPayload,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    await this.authFlowService.handleLogout(user.sub, response);
    return {
      message: 'You have been logged out successfully',
    };
  }

  @Get(AuthRoutes.ME)
  @ApiEndpoint(UserResponseDto)
  @UseGuards(UniversalAuthGuard)
  @ResponseMessage('Current user fetched')
  getCurrentUser(@CurrentUser() user: JwtPayload): { user: CurrentUserResponseDto } {
    return {
      user: {
        id: user.sub,
        email: user.email,
        role: user.role,
      },
    };
  }
}
