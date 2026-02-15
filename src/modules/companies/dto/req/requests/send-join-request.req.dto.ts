import { IsOptional, IsString, MaxLength } from 'class-validator';

export class SendJoinRequestDto {
  @IsOptional()
  @IsString({ message: 'Message must be a string' })
  @MaxLength(255, { message: 'Message must not exceed 500 characters' })
  message?: string;
}
