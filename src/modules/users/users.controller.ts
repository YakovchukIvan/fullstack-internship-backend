import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/req/create-user.req.dto';
import { UpdateUserDto } from './dto/req/update-user.req.dto';
import { UserResponseDto } from './dto/res/user.res.dto';
import { UUIDParam } from '@/common/decorators/uuid-param.decorator';
import { UsersRoutes } from './routes/users.routes';
import { UsersPaginationQueryDto } from './dto/req/users-pagination-query.req.dto';
import { ApiEndpoint } from '@/common/decorators/api-endpoint.decorator';
import { UserRole } from '@/common/enums/user-role.enum';
import { ResponseMessage } from '@/common/decorators/response-message.decorator';
import { UsersPaginatedBaseResponseDto } from './dto/res/users-paginated.res.dto';
import { Roles } from '@/modules/auth/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { toUserResponseDto } from './mappers/user.mapper';
import { UsersSwagger } from '@/common/constants/swagger-docs/users.swagger';
import { FileUploadPipe } from '@/common/pipes/file-upload.pipe';
import type { JwtPayload } from '@/common/interfaces/jwt-payload.interface';

@Controller(UsersRoutes.ROOT)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @ApiEndpoint(UserResponseDto, HttpStatus.CREATED, UsersSwagger.CREATE)
  @Roles(UserRole.OWNER)
  @ResponseMessage('User created successfully')
  async create(@Body() dto: CreateUserDto): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.create(dto);
    return { user: toUserResponseDto(user) };
  }

  @Get()
  @ApiEndpoint(UsersPaginatedBaseResponseDto, HttpStatus.OK, UsersSwagger.FIND_ALL)
  async findAll(@Query() paginationQuery: UsersPaginationQueryDto): Promise<UsersPaginatedBaseResponseDto> {
    const result = await this.usersService.findAll(paginationQuery);
    return {
      users: result.detail.map(toUserResponseDto),
      pagination: result.pagination,
    };
  }

  @Get(UsersRoutes.ME)
  @ApiEndpoint(UserResponseDto, HttpStatus.OK, UsersSwagger.FIND_ME)
  async findMe(@CurrentUser() currentUser: JwtPayload): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.findOne(currentUser.sub);
    return { user: toUserResponseDto(user) };
  }

  @Get(UsersRoutes.ID)
  @Roles(UserRole.OWNER)
  @ApiEndpoint(UserResponseDto, HttpStatus.OK, UsersSwagger.FIND_ONE)
  async findOne(@UUIDParam() id: string): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.findOne(id);
    return { user: toUserResponseDto(user) };
  }

  @Patch(UsersRoutes.AVATAR)
  @UseInterceptors(FileInterceptor('avatar'))
  @ApiEndpoint(UserResponseDto, HttpStatus.OK, UsersSwagger.UPDATE_AVATAR)
  @ResponseMessage('Avatar updated successfully')
  async updateAvatar(
    @CurrentUser() currentUser: JwtPayload,
    @UploadedFile(new FileUploadPipe()) file: Express.Multer.File,
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.updateAvatar(currentUser.sub, file);
    return { user: toUserResponseDto(user) };
  }

  @Patch(UsersRoutes.ME)
  @ApiEndpoint(UserResponseDto, HttpStatus.OK, UsersSwagger.UPDATE_ME)
  @ResponseMessage('Profile updated successfully')
  async updateMe(
    @CurrentUser() currentUser: JwtPayload,
    @Body() dto: UpdateUserDto,
  ): Promise<{ user: UserResponseDto }> {
    const user = await this.usersService.update(currentUser.sub, dto);
    return { user: toUserResponseDto(user) };
  }

  @Delete(UsersRoutes.ME)
  @ApiEndpoint(Object, HttpStatus.OK, UsersSwagger.REMOVE_ME)
  @HttpCode(HttpStatus.OK)
  @ResponseMessage('Profile deleted successfully')
  async removeMe(@CurrentUser() currentUser: JwtPayload): Promise<void> {
    await this.usersService.remove(currentUser.sub);
  }
}
