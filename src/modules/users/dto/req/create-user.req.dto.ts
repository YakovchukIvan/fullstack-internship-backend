import { EmailPasswordDto } from '@/common/entities/email-password.dto';
import { UserProfileBaseDto } from '@/common/entities/user-profile.base.dto';
import { IntersectionType } from '@nestjs/swagger';

export class CreateUserDto extends IntersectionType(EmailPasswordDto, UserProfileBaseDto) {}
