import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { UserResponseDto } from './dto/res/user.res.dto';
import { UUIDParam } from '@/common/decorators/uuid-param.decorator';
import { toUserResponseDto } from './mappers/user.mapper';
import { UsersRoutes } from './routes/users.routes';
import { PaginationMetadata } from '@/common/interfaces/pagination-metadata.interface';
import { UsersPaginationQueryDto } from './dto/req/users-pagination-query.dto';
import { UniversalAuthGuard } from '../auth/guards/universal-auth.guard';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { UserRole } from '@/common/enums/user-role.enum';
import { Roles } from '../auth/decorators/roles.decorator';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { ResourceOwnerGuard } from '../auth/guards/resource-owner.guard';

@Controller(UsersRoutes.ROOT)
@UseGuards(UniversalAuthGuard, RolesGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiEndpoint(CreateUserDto, HttpStatus.CREATED)
  @Roles(UserRole.OWNER)
  @ResponseMessage('User created successfully')
  async create(@Body() dto: CreateUserDto): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.create(dto);
    return {
      user: toUserResponseDto(user),
    };
  }

  @Get()
  @Roles(UserRole.OWNER, UserRole.ADMIN)
  @ApiEndpoint(UserResponseDto, HttpStatus.OK)
  async findAll(
    @Query() paginationQuery: UsersPaginationQueryDto,
  ): Promise<{ users: UserResponseDto[]; pagination: PaginationMetadata }> {
    const result = await this.usersService.findAll(paginationQuery);
    return {
      users: result.data.map(toUserResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(UsersRoutes.ID)
  @UseGuards(ResourceOwnerGuard)
  @ApiEndpoint(UserResponseDto, HttpStatus.OK)
  async findOne(@UUIDParam() id: string): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.findOne(id);
    return {
      user: toUserResponseDto(user),
    };
  }

  @Patch(UsersRoutes.ID)
  @UseGuards(ResourceOwnerGuard)
  @ApiEndpoint(UpdateUserDto, HttpStatus.OK)
  @ResponseMessage('User updated successfully')
  async update(@UUIDParam() id: string, @Body() dto: UpdateUserDto): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.update(id, dto);
    return {
      user: toUserResponseDto(user),
    };
  }

  @Delete(UsersRoutes.ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  @UseGuards(RolesGuard)
  @Roles(UserRole.OWNER)
  async remove(@UUIDParam() id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
