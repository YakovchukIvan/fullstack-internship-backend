import { UserBasicDto } from '@/common/dto/res/user-basic.dto';
import { CompanyRole } from '@/common/enums/company-role.enum';

export class CompanyMemberResponseDto {
  id: string;
  role: CompanyRole;
  user: UserBasicDto;
  createdAt: string;
  updatedAt: string;
}
