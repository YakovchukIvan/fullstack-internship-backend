import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
  IsInt,
  Min,
  Max,
  IsArray,
  ValidateNested,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength,
  MaxLength,
  IsOptional,
} from 'class-validator';
import { QUIZ_QUESTIONS_MIN, QUIZ_QUESTIONS_MAX } from '../../constants/quiz.constants';
import { QuizQuestionDto } from './quiz-question.dto';

export class CreateQuizDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(3, { message: 'Title must be at least 3 characters' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsInt({ message: 'Frequency must be a number' })
  @Min(1, { message: 'Frequency must be at least 1 day' })
  @Max(365, { message: 'Frequency must not exceed 365 days' })
  frequencyInDays: number;

  @IsArray({ message: 'Questions must be an array' })
  @ArrayMinSize(QUIZ_QUESTIONS_MIN, { message: `Quiz must have at least ${QUIZ_QUESTIONS_MIN} questions` })
  @ArrayMaxSize(QUIZ_QUESTIONS_MAX, { message: `Quiz can have maximum ${QUIZ_QUESTIONS_MAX} questions` })
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}
