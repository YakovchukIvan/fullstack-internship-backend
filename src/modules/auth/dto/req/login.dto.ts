import { EmailPasswordDto } from '@/common/dto/req/email-password.dto';
import { IntersectionType } from '@nestjs/swagger';

export class LoginDto extends IntersectionType(EmailPasswordDto) {}
