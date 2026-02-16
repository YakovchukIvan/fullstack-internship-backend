import { QuizResponseDto } from './quiz.res.dto';
import { PaginatedBaseResponseDto } from '@/common/dto/res/pagination-metadata.dto';

export class QuizzesPaginatedResponseDto extends PaginatedBaseResponseDto {
  quizzes: QuizResponseDto[];
}
