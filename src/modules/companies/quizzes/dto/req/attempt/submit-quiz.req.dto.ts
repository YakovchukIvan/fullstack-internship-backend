import { Type } from 'class-transformer';
import { ArrayMinSize, IsArray, IsInt, Min, ValidateNested } from 'class-validator';

export class QuizQuestionAnswerDto {
  @IsArray()
  @IsInt({ each: true })
  @Min(0, { each: true })
  selectedOptionIndexes: number[];
}

export class SubmitQuizDto {
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionAnswerDto)
  answers: QuizQuestionAnswerDto[];
}
