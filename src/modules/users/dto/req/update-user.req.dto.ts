import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.req.dto';

export class UpdateUserDto extends PartialType(CreateUserDto) {}
