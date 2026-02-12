import { UserBasicDto } from '@/common/dto/res/user-basic.dto';
import { InvitationStatus } from '../../enums/invitation-status.enum';
import { CompanyBasicDto } from './company-basic.dto';

export class CompanyInvitationResponseDto {
  id: string;
  user: UserBasicDto;
  company: CompanyBasicDto;
  invitedBy: UserBasicDto;
  message: string | null;
  status: InvitationStatus;
  createdAt: string;
  updatedAt: string;
}
