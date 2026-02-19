import { PaginationQueryDto } from '@/common/dto/req/pagination-query.dto';
import { IsEnum, IsOptional } from 'class-validator';
import { QuizSortField } from '../../enums/quiz-sort-field.enum';

export class QuizzesPaginationDto extends PaginationQueryDto {
  @IsOptional()
  @IsEnum(QuizSortField)
  sortBy: QuizSortField = QuizSortField.CREATED_AT;
}
