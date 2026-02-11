import { EmailPasswordDto } from '@/common/dto/req/email-password.dto';
import { UserProfileBaseDto } from '@/common/dto/req/user-profile.base.dto';
import { IntersectionType } from '@nestjs/swagger';

export class CreateUserDto extends IntersectionType(EmailPasswordDto, UserProfileBaseDto) {}
