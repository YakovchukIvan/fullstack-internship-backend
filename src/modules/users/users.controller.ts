import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { UserResponseDto } from './dto/res/user.res.dto';
import { UUIDParam } from '@/common/decorators/uuid-param.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtPayload } from '../auth/interfaces/jwt-payload.interface';
import { toUserResponseDto } from './mappers/user.mapper';
import { UsersRoutes } from './routes/users.routes';
import { UsersPaginationQueryDto } from './dto/req/users-pagination-query.dto';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { UsersPaginatedResponseDto } from './dto/res/users-paginated-response.dto';

@Controller(UsersRoutes.ROOT)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiEndpoint(UserResponseDto, HttpStatus.CREATED)
  @Roles(UserRole.OWNER)
  @ResponseMessage('User created successfully')
  async create(@Body() dto: CreateUserDto): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.create(dto);
    return {
      user: toUserResponseDto(user),
    };
  }

  @Get()
  @Roles(UserRole.OWNER)
  @ApiEndpoint(UsersPaginatedResponseDto, HttpStatus.OK)
  async findAll(@Query() paginationQuery: UsersPaginationQueryDto): Promise<UsersPaginatedResponseDto> {
    const result = await this.usersService.findAll(paginationQuery);
    return {
      users: result.detail.map(toUserResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(UsersRoutes.ME)
  @Roles(UserRole.USER, UserRole.OWNER)
  @ApiEndpoint(UserResponseDto, HttpStatus.OK)
  async findMe(@CurrentUser() currentUser: JwtPayload): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.findOne(currentUser.sub);
    return {
      user: toUserResponseDto(user),
    };
  }

  @Get(UsersRoutes.ID)
  @Roles(UserRole.OWNER)
  @ApiEndpoint(UserResponseDto, HttpStatus.OK)
  async findOne(@UUIDParam() id: string): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.findOne(id);
    return {
      user: toUserResponseDto(user),
    };
  }

  @Patch(UsersRoutes.ME)
  @Roles(UserRole.USER, UserRole.OWNER)
  @ApiEndpoint(UserResponseDto, HttpStatus.OK)
  @ResponseMessage('Profile updated successfully')
  async updateMe(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.update(currentUser.sub, dto);
    return {
      user: toUserResponseDto(user),
    };
  }

  @Delete(UsersRoutes.ME)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles(UserRole.USER)
  @ResponseMessage('Profile deleted successfully')
  async removeMe(@CurrentUser() currentUser: JwtPayload): Promise<void> {
    await this.usersService.remove(currentUser.sub);
  }
}
