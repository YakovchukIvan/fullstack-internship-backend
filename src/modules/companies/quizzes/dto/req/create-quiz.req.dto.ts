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
import { QuizConfig } from '../../shared/constants/quiz.constants';
import { QuizQuestionDto } from './quiz-question.dto';

export class CreateQuizDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(2, { message: 'Title must be at least 2 characters' })
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
  @ArrayMinSize(QuizConfig.QUESTIONS.MIN, { message: `Quiz must have at least ${QuizConfig.QUESTIONS.MIN} questions` })
  @ArrayMaxSize(QuizConfig.QUESTIONS.MAX, { message: `Quiz can have maximum ${QuizConfig.QUESTIONS.MAX} questions` })
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];

  @IsInt({ message: 'Time limit must be a number' })
  @Min(20, { message: 'Time limit must be at least 20 minutes' })
  @Max(120, { message: 'Time limit must not exceed 120 minutes' })
  timeLimitMinutes: number;
}
