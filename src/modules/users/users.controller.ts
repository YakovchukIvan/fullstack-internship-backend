import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { UserResponseDto } from './dto/res/user.res.dto';
import { ApiResponseEnvelope } from '@/common/responses/api-response-envelope';
import { UUIDParam } from '@/common/decorators/uuid-param.decorator';
import { toUserResponseDto } from './mappers/user.mapper';
import { UsersRoutes } from './enums/users.routes';
import { PaginationMetadata } from '@/common/interfaces/pagination-metadata.interface';
import { UsersPaginationQueryDto } from './dto/req/users-pagination-query.dto';

@Controller(UsersRoutes.ROOT)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<ApiResponseEnvelope<{ user: UserResponseDto }>> {
    const user = await this.usersService.create(dto);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'User created',
      detail: { user: toUserResponseDto(user) },
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(
    @Query() paginationQuery: UsersPaginationQueryDto,
  ): Promise<ApiResponseEnvelope<{ users: UserResponseDto[]; pagination: PaginationMetadata }>> {
    const result = await this.usersService.findAll(paginationQuery);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Users fetched',
      detail: {
        users: result.data.map(toUserResponseDto),
        pagination: result.pagination,
      },
    });
  }

  @Get(UsersRoutes.ID)
  @HttpCode(HttpStatus.OK)
  async findOne(@UUIDParam() id: string): Promise<ApiResponseEnvelope<{ user: UserResponseDto }>> {
    const user = await this.usersService.findOne(id);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User fetched',
      detail: { user: toUserResponseDto(user) },
    });
  }

  @Patch(UsersRoutes.ID)
  @HttpCode(HttpStatus.OK)
  async update(
    @UUIDParam() id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<ApiResponseEnvelope<{ user: UserResponseDto }>> {
    const user = await this.usersService.update(id, dto);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User updated',
      detail: { user: toUserResponseDto(user) },
    });
  }

  @Delete(UsersRoutes.ID)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@UUIDParam() id: string): Promise<void> {
    await this.usersService.remove(id);
  }
}
