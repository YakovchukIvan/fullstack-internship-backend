import { IsString, MinLength, Matches } from 'class-validator';
// import { ApiProperty } from '@nestjs/swagger';

export class ResetPasswordDto {
  // @ApiProperty({
  //   description: 'Password reset token from email',
  //   example: 'a1b2c3d4e5f6...',
  // })
  @IsString()
  token: string;

  // @ApiProperty({
  //   description: 'New password (min 8 characters, must contain uppercase, lowercase, number)',
  //   example: 'NewPassword123',
  //   minLength: 8,
  // })
  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  newPassword: string;
}
