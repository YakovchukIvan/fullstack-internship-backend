import { EmailPasswordDto } from '@/common/dto/email-password.dto';
import { IntersectionType } from '@nestjs/swagger';

export class LoginDto extends IntersectionType(EmailPasswordDto) {}
