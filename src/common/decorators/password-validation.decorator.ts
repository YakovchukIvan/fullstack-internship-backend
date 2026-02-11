import { IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';
import { applyDecorators } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';

export function PasswordValidation() {
  return applyDecorators(
    ApiProperty({ minLength: 8, maxLength: 50 }),
    IsString({ message: 'Password must be a string' }),
    IsNotEmpty({ message: 'Password is required' }),
    MinLength(8, { message: 'Password must be at least 8 characters long' }),
    MaxLength(50, { message: 'Password must not exceed 50 characters' }),
  );
}
