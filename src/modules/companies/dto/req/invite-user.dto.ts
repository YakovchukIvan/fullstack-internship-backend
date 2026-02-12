import { IsEmail } from 'class-validator';
import { NormalizeEmail } from '@/common/decorators/normalize-email.decorator';

export class InviteUserDto {
  @IsEmail({}, { message: 'Invalid email format' })
  @NormalizeEmail()
  email: string;
}
