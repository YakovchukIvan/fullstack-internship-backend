import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';

export class UserQuizListItemResponseDto {
  id: string;
  title: string;
  companyName: string;
  slug: string;
  isAiGenerated: boolean;
  aiPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class UserQuizzesListResponseDto extends PaginatedBaseResponseDto {
  quizzes: UserQuizListItemResponseDto[];
}
