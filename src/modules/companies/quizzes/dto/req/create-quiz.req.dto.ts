import { Type } from 'class-transformer';
import {
  IsString,
  IsNotEmpty,
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
import { QuizBaseDto } from './quiz-base.req.dto';

export class CreateQuizDto extends QuizBaseDto {
  @IsString({ message: 'Title must be a string' })
  @IsNotEmpty({ message: 'Title is required' })
  @MinLength(2, { message: 'Title must be at least 2 characters' })
  @MaxLength(255, { message: 'Title must not exceed 255 characters' })
  title: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  @MaxLength(1000, { message: 'Description must not exceed 1000 characters' })
  description?: string;

  @IsArray({ message: 'Questions must be an array' })
  @ArrayMinSize(QuizConfig.QUESTIONS.MIN, { message: `Quiz must have at least ${QuizConfig.QUESTIONS.MIN} questions` })
  @ArrayMaxSize(QuizConfig.QUESTIONS.MAX, { message: `Quiz can have maximum ${QuizConfig.QUESTIONS.MAX} questions` })
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}
