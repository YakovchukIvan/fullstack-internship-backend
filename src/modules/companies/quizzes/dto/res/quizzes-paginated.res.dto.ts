import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';
import { QuizWithQuestionsDto } from './quiz-session.res.dto';

export class QuizListResponseDto extends QuizWithQuestionsDto {}

export class QuizzesPaginatedResponseDto extends PaginatedBaseResponseDto {
  quizzes: QuizListResponseDto[];
}
