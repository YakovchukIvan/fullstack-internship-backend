import { IsEmail } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';
import { NormalizeEmail } from '@/common/decorators/normalize-email.decorator';

export class ForgotPasswordDto {
  // @ApiProperty({
  //   description: 'User email address',
  //   example: 'user@example.com',
  // })
  @IsEmail({}, { message: 'Invalid email format' })
  @NormalizeEmail()
  email: string;
}
