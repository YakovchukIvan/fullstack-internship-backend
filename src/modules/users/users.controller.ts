import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Patch, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { User } from './entities/user.entity';
import { ApiResponseEnvelope } from '@/common/dto/api-response-envelope';
import { UUIDParam } from '@/common/decorators/uuid-param.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateUserDto): Promise<ApiResponseEnvelope<{ user: User }>> {
    const user = await this.usersService.create(dto);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.CREATED,
      message: 'User created',
      detail: { user },
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponseEnvelope<{ users: User[] }>> {
    const users = await this.usersService.findAll();

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'Users fetched',
      detail: { users },
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@UUIDParam() id: string): Promise<ApiResponseEnvelope<{ user: User }>> {
    const user = await this.usersService.findOne(id);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User fetched',
      detail: { user },
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@UUIDParam() id: string, @Body() dto: UpdateUserDto): Promise<ApiResponseEnvelope<{ user: User }>> {
    const user = await this.usersService.update(id, dto);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User updated',
      detail: { user },
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@UUIDParam() id: string): Promise<ApiResponseEnvelope<{ id: string }>> {
    await this.usersService.remove(id);

    return new ApiResponseEnvelope({
      success: true,
      statusCode: HttpStatus.OK,
      message: 'User deleted',
      detail: { id },
    });
  }
}
