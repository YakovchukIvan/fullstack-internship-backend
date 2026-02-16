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
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ValidateCorrectAnswers } from '../../validators/correct-answers.validator';

export class QuizQuestionDto {
  @IsString({ message: 'Question must be a string' })
  @IsNotEmpty({ message: 'Question is required' })
  @MinLength(10, { message: 'Question must be at least 10 characters' })
  @MaxLength(500, { message: 'Question must not exceed 500 characters' })
  question: string;

  @IsArray({ message: 'Options must be an array' })
  @ArrayMinSize(2, { message: 'Each question must have at least 2 options' })
  @ArrayMaxSize(4, { message: 'Each question can have maximum 4 options' })
  @IsString({ each: true, message: 'Each option must be a string' })
  options: string[];

  @IsArray({ message: 'Correct answers must be an array' })
  @IsInt({ each: true, message: 'Each correct answer must be a number' })
  @ArrayMinSize(1, { message: 'At least one correct answer is required' })
  @ArrayMaxSize(4, { message: 'Maximum 4 correct answers allowed' })
  @ValidateCorrectAnswers()
  correctAnswers: number[];

  @IsBoolean({ message: 'isMultiSelect must be a boolean' })
  @IsOptional()
  isMultiSelect?: boolean;
}

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
  @ArrayMinSize(2, { message: 'Quiz must have at least 2 questions' })
  @ArrayMaxSize(20, { message: 'Quiz can have maximum 20 questions' })
  @ValidateNested({ each: true })
  @Type(() => QuizQuestionDto)
  questions: QuizQuestionDto[];
}
