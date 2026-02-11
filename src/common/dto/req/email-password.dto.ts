import { IsEmail, IsNotEmpty } from 'class-validator';
import { NormalizeEmail } from '@/common/decorators/normalize-email.decorator';
import { PasswordValidation } from '../../decorators/password-validation.decorator';
import { ApiProperty } from '@nestjs/swagger';

export class EmailPasswordDto {
  @ApiProperty({ example: 'user@example.com' })
  @NormalizeEmail()
  @IsEmail({}, { message: 'Email must be a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({ example: 'string123' })
  @PasswordValidation()
  password: string;
}
