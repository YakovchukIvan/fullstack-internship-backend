import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/res/auth-response.dto';
import { ApiResponseEnvelope } from '@/common/responses/api-response-envelope';
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
import { MailService } from '../mail/mail.service';
import { ForgotPasswordDto } from './dto/req/forgot-password.dto';
import { ResetPasswordDto } from './dto/req/reset-password.dto';

@Controller(AuthRoutes.ROOT)
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly mailService: MailService,
  ) {}

  @Post(AuthRoutes.REGISTER)
  @ApiSecurity({})
  @ApiEndpoint(AuthResponseDto, HttpStatus.CREATED)
  async register(@Body() registerDto: RegisterDto): Promise<ApiResponseEnvelope<AuthResponseDto>> {
    const authResponse = await this.authService.register(registerDto);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'User registered successfully',
      detail: authResponse,
    });
  }

  @Post(AuthRoutes.LOGIN)
  @ApiSecurity({})
  @ApiEndpoint(AuthResponseDto, HttpStatus.OK)
  @UseGuards(LocalAuthGuard)
  async login(@Body() loginDto: LoginDto): Promise<ApiResponseEnvelope<AuthResponseDto>> {
    const authResponse = await this.authService.login(loginDto);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Login successful',
      detail: authResponse,
    });
  }

  @Get(AuthRoutes.ME)
  @ApiEndpoint(UserResponseDto)
  @UseGuards(UniversalAuthGuard)
  getCurrentUser(@CurrentUser() user: User): ApiResponseEnvelope<{ user: UserResponseDto }> {
    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Current user fetched',
      detail: {
        user: toUserResponseDto(user),
      },
    });
  }

  @Post(AuthRoutes.FORGOT_PASSWORD)
  @ApiSecurity({})
  @ApiEndpoint(Object, HttpStatus.OK)
  async forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ApiResponseEnvelope<{ message: string }>> {
    const result = await this.authService.forgotPassword(forgotPasswordDto.email);

    if (result.isOAuthUser && result.provider) {
      // OAuth користувач - відправляємо інший лист
      await this.mailService.sendOAuthLoginReminderEmail(forgotPasswordDto.email, result.provider);

      return new ApiResponseEnvelope({
        success: true,
        statusCode: HttpStatus.OK,
        message: 'Login instructions sent',
        detail: {
          message: `This account uses ${result.provider} Sign In. Please check your email for login instructions.`,
        },
      });
    }

    if (result.resetToken) {
      // Звичайний користувач - відправляємо reset link
      await this.mailService.sendPasswordResetEmail(forgotPasswordDto.email, result.resetToken);
    }

    // Завжди повертаємо нейтральну відповідь (безпека)
    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Password reset email sent successfully',
      detail: {
        message: 'If an account exists with this email, you will receive instructions shortly',
      },
    });
  }

  @Post(AuthRoutes.RESET_PASSWORD)
  @ApiSecurity({})
  @ApiEndpoint(Object, HttpStatus.OK)
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<ApiResponseEnvelope<{ message: string }>> {
    await this.authService.resetPassword(resetPasswordDto.token, resetPasswordDto.newPassword);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Password has been reset successfully',
      detail: {
        message: 'You can now login with your new password',
      },
    });
  }
}
