import { UserResponseDto } from '@/modules/users/dto/res/user.res.dto';

export class AuthResponseDto {
  accessToken: string;
  refreshToken?: string;
  user: UserResponseDto;
  expiresIn: number;
}
