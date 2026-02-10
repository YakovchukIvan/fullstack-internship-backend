import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { applyDecorators } from '@nestjs/common';

export function PasswordValidation() {
  return applyDecorators(
    IsString({ message: 'Password must be a string' }),
    IsNotEmpty({ message: 'Password is required' }),
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    MaxLength(50, { message: 'Password must not exceed 50 characters' }),
  );
}
