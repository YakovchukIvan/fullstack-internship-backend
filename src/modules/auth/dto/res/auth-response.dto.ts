import { UserResponseDto } from '@/modules/users/dto/res/users/user.res.dto';

export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  user: UserResponseDto;
  expiresIn: number;
}
