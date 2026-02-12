export class CompanyInvitationResponseDto {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    avatarUrl: string | null;
  };
  company: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    avatarUrl: string | null;
  };
  invitedBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  createdAt: string;
  updatedAt: string;
}
