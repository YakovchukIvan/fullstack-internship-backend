import type { Response, Request } from 'express';
import { Body, Controller, Get, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { LoginDto } from './dto/req/login.dto';
import { AuthResponseDto } from './dto/res/auth-response.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserResponseDto } from '../users/dto/res/users/user.res.dto';
import { AuthRoutes } from './routes/auth.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { RegisterDto } from './dto/req/register.dto';
import { ApiSecurity } from '@nestjs/swagger';
import { ForgotPasswordDto } from './dto/req/forgot-password.dto';
import { ResetPasswordDto } from './dto/req/reset-password.dto';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { AuthFacadeService } from './services/auth-facade.service';
import { AuthSwagger } from '@/common/constants/swagger-docs/auth.swagger';
import { CurrentUserResponseDto } from './dto/res/current-user.res.dto';
import { Public } from './decorators/public.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { Roles } from './decorators/roles.decorator';
import { UnauthorizedException } from '@nestjs/common';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';
import type { AccessTokenPayload } from './interfaces/token-payload.interface';

interface RequestWithCookies extends Request {
  cookies: Record<string, string>;
}

@Controller(AuthRoutes.ROOT)
export class AuthController {
  constructor(private readonly authFacadeService: AuthFacadeService) {}

  @Get(AuthRoutes.ME)
  @ApiEndpoint(UserResponseDto, HttpStatus.OK, AuthSwagger.ME)
  @Roles(UserRole.USER, UserRole.OWNER)
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

  @Public()
  @Post(AuthRoutes.REGISTER)
  @ApiSecurity({})
  @ApiEndpoint(AuthResponseDto, HttpStatus.CREATED, AuthSwagger.REGISTER)
  @ResponseMessage('User registered successfully')
  async register(
    @Body() registerDto: RegisterDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    return this.authFacadeService.handleRegister(registerDto, response);
  }

  @Public()
  @Post(AuthRoutes.LOGIN)
  @ApiSecurity({})
  @ApiEndpoint(AuthResponseDto, HttpStatus.OK, AuthSwagger.LOGIN)
  @ResponseMessage('Login successful')
  async login(@Body() loginDto: LoginDto, @Res({ passthrough: true }) response: Response): Promise<AuthResponseDto> {
    return this.authFacadeService.handleLogin(loginDto, response);
  }

  @Public()
  @Post(AuthRoutes.REFRESH)
  @ApiSecurity({})
  @ApiEndpoint(AuthResponseDto, HttpStatus.OK, AuthSwagger.REFRESH)
  @ResponseMessage('Token refreshed successfully')
  async refresh(
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ): Promise<AuthResponseDto> {
    const refreshToken = request.cookies['refresh_token'];

    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    return this.authFacadeService.handleRefresh(refreshToken, response);
  }

  @Public()
  @Post(AuthRoutes.FORGOT_PASSWORD)
  @ApiSecurity({})
  @ApiEndpoint(Object, HttpStatus.OK, AuthSwagger.FORGOT_PASSWORD)
  @ResponseMessage('Password reset request processed')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const result = await this.authFacadeService.handleForgotPassword(forgotPasswordDto.email);
    return { message: result.message };
  }

  @Public()
  @Post(AuthRoutes.RESET_PASSWORD)
  @ApiSecurity({})
  @ApiEndpoint(Object, HttpStatus.OK, AuthSwagger.RESET_PASSWORD)
  @ResponseMessage('Password has been reset successfully')
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    await this.authFacadeService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);
    return { message: 'You can now login with your new password' };
  }

  @Post(AuthRoutes.LOGOUT)
  @ApiEndpoint(Object, HttpStatus.OK, AuthSwagger.LOGOUT)
  @Roles(UserRole.USER, UserRole.OWNER)
  @ResponseMessage('Logout successful')
  async logout(
    @CurrentUser() user: AccessTokenPayload,
    @Req() request: RequestWithCookies,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ message: string }> {
    const refreshToken = request.cookies['refresh_token'];
    await this.authFacadeService.handleLogout(user, refreshToken, response);
    return { message: 'You have been logged out successfully' };
  }
}
