import { UserBasicDto } from '@/common/dto/res/user-basic.dto';
import { InvitationStatus } from '../../enums/invitation-status.enum';
import { CompanyBasicDto } from './company-basic.dto';

export class CompanyInvitationItemDto {
  id: string;
  user: UserBasicDto;
  invitedBy: UserBasicDto;
  message: string | null;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}

export class CompanyInvitationResponseDto {
  invitations: CompanyInvitationItemDto[];
  company: CompanyBasicDto;
}
