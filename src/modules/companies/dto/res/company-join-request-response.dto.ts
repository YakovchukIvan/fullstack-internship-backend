import { UserBasicDto } from '@/common/dto/res/user-basic.dto';
import { InvitationStatus } from '../../enums/invitation-status.enum';
import { CompanyBasicDto } from './company-basic.dto';

export class CompanyJoinRequestItemDto {
  id: string;
  user: UserBasicDto;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export class CompanyJoinRequestResponseDto {
  joinRequest: CompanyJoinRequestItemDto[];
  company: CompanyBasicDto;
}
