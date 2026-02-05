import { EmailPasswordDto } from '@/common/dto/email-password.dto';
import { UserProfileBaseDto } from '@/common/dto/user-profile.base.dto';
import { IntersectionType } from '@nestjs/swagger';

export class CreateUserDto extends IntersectionType(EmailPasswordDto, UserProfileBaseDto) {}
