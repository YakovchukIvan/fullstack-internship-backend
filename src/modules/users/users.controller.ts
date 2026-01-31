import { Controller, Get, Post, Body, Patch, Delete, HttpCode, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { User } from './entities/user.entity';
import { ApiResponse } from '@/common/dto/api-response.interface';
import { UUIDParam } from '@/common/decorators/uuid-param.decorator';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createUserDto: CreateUserDto): Promise<ApiResponse<{ user: User }>> {
    const user = await this.usersService.create(createUserDto);

    return new ApiResponse<{ user: User }>({
      success: true,
      status_code: HttpStatus.CREATED,
      message: 'User created',
      detail: { user },
    });
  }

  @Get()
  @HttpCode(HttpStatus.OK)
  async findAll(): Promise<ApiResponse<{ users: User[] }>> {
    const users = await this.usersService.findAll();

    return new ApiResponse<{ users: User[] }>({
      success: true,
      status_code: HttpStatus.OK,
      detail: { users },
    });
  }

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  async findOne(@UUIDParam() id: string): Promise<ApiResponse<{ user: User }>> {
    const user = await this.usersService.findOne(id);

    return new ApiResponse<{ user: User }>({
      success: true,
      status_code: HttpStatus.OK,
      detail: { user },
    });
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  async update(@UUIDParam() id: string, @Body() updateUserDto: UpdateUserDto): Promise<ApiResponse<{ user: User }>> {
    const user = await this.usersService.update(id, updateUserDto);

    return new ApiResponse<{ user: User }>({
      success: true,
      status_code: HttpStatus.OK,
      message: 'User updated',
      detail: { user },
    });
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@UUIDParam() id: string): Promise<ApiResponse<{ message: string }>> {
    await this.usersService.remove(id);

    return new ApiResponse<{ message: string }>({
      success: true,
      status_code: HttpStatus.OK,
      detail: { message: `User with ID ${id} has been successfully deleted` },
    });
  }
}
