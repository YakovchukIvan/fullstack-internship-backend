import { PasswordValidation } from '@/common/decorators/password-validation.decorator';
import { IsString } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @PasswordValidation()
  newPassword: string;
}
