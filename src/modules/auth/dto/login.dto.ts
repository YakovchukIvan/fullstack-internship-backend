import { EmailPasswordDto } from '@/common/entities/email-password.dto';
import { IntersectionType } from '@nestjs/swagger';

export class LoginDto extends IntersectionType(EmailPasswordDto) {}
