export class CompanyJoinRequestResponseDto {
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
  createdAt: string;
  updatedAt: string;
}
