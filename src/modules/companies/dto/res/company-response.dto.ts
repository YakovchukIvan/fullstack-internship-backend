export class CompanyResponseDto {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  avatarUrl: string | null;
  isVisible: boolean;
  ownerId: string;
  membersCount: number;
  createdAt: string;
  updatedAt: string;
}
