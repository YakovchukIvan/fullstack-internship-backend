import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.req.dto';

export class UpdateUserDto extends PartialType(OmitType(CreateUserDto, ['email'] as const)) {}
