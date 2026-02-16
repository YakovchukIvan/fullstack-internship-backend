import { IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';
import { NormalizeEmail } from '@/common/decorators/normalize-email.decorator';

export class InviteUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @NormalizeEmail()
  email: string;

  @IsString()
  @IsOptional()
  @MaxLength(255, { message: 'Message is too long' })
  message?: string;
}
