import { EmailPasswordDto } from '@/common/dto/req/email-password.dto';
import { OmitType } from '@nestjs/swagger';

export class ForgotPasswordDto extends OmitType(EmailPasswordDto, ['password'] as const) {}
