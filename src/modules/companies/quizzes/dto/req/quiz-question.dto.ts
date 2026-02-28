import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength,
  MaxLength,
} from 'class-validator';
import { ValidateCorrectAnswers } from '../../shared/validators/correct-answers.validator';
import { QuizConfig } from '../../shared/constants/quiz.constants';

export class QuizQuestionDto {
  @IsString({ message: 'Question must be a string' })
  @IsNotEmpty({ message: 'Question is required' })
  @MinLength(3, { message: 'Question must be at least 3 characters' })
  @MaxLength(500, { message: 'Question must not exceed 500 characters' })
  question: string;

  @IsArray({ message: 'Options must be an array' })
  @ArrayMinSize(QuizConfig.OPTIONS.MIN, {
    message: `Each question must have at least ${QuizConfig.OPTIONS.MIN} options`,
  })
  @ArrayMaxSize(QuizConfig.OPTIONS.MAX, { message: `Each question can have maximum ${QuizConfig.OPTIONS.MAX} options` })
  @IsString({ each: true, message: 'Each option must be a string' })
  @IsNotEmpty({ each: true, message: 'Option text cannot be empty' })
  options: string[];

  @IsArray({ message: 'Correct answers must be an array' })
  @IsInt({ each: true, message: 'Each correct answer must be a number' })
  @ArrayMinSize(QuizConfig.CORRECT_ANSWERS.MIN, { message: 'At least one correct answer is required' })
  @ArrayMaxSize(QuizConfig.CORRECT_ANSWERS.MAX, {
    message: `Maximum ${QuizConfig.CORRECT_ANSWERS.MAX} correct answers allowed`,
  })
  @ValidateCorrectAnswers()
  correctAnswers: number[];
}
