import { Body, Controller, Get, HttpCode, HttpStatus, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { LoginDto } from './dto/login.dto';
import { AuthResponseDto } from './dto/auth-response.dto';
import { ApiResponseEnvelope } from '@/common/responses/api-response-envelope';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { UniversalAuthGuard } from './guards/universal-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { toUserResponseDto } from '../users/mappers/user.mapper';
import { UserResponseDto } from '../users/dto/res/user.res.dto';
import { AuthRoutes } from './enums/auth.routes';

@Controller(AuthRoutes.ROOT)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post(AuthRoutes.LOGIN)
  @HttpCode(HttpStatus.OK)
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
  @HttpCode(HttpStatus.OK)
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
}
