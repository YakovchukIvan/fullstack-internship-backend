import { Body, Controller, Get, HttpStatus, Post, UseGuards } from '@nestjs/common';
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
import { AuthRoutes } from './routes/auth.routes';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { RegisterDto } from './dto/req/register.dto';
import { ApiSecurity } from '@nestjs/swagger';

@Controller(AuthRoutes.ROOT)
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
