import { IsEmail, IsNotEmpty } from 'class-validator';
import { NormalizeEmail } from '@/common/decorators/normalize-email.decorator';
import { PasswordValidation } from '../decorators/password-validation.decorator';

export class EmailPasswordDto {
  @NormalizeEmail()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @PasswordValidation()
  password: string;
}
