import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { QuizWithQuestionsDto } from './quiz-session.res.dto';

export class QuizListResponseDto extends QuizWithQuestionsDto {}

export class QuizzesPaginatedResponseDto extends PaginatedBaseResponseDto {
  quizzes: QuizListResponseDto[];
}

export class UserQuizListItemResponseDto {
  id: string;
  title: string;
  isAiGenerated: boolean;
  aiPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}

export class UserQuizzesListResponseDto extends PaginatedBaseResponseDto {
  quizzes: UserQuizListItemResponseDto[];
}
