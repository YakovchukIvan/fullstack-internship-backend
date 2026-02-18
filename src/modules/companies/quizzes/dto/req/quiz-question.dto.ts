import {
  IsString,
  IsNotEmpty,
  IsInt,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MinLength,
  MaxLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { ValidateCorrectAnswers } from '../../validators/correct-answers.validator';
import { QUIZ_OPTIONS_MIN, QUIZ_OPTIONS_MAX, QUIZ_CORRECT_ANSWERS_MAX } from '../../constants/quiz.constants';

export class QuizQuestionDto {
  @IsString({ message: 'Question must be a string' })
  @IsNotEmpty({ message: 'Question is required' })
  @MinLength(10, { message: 'Question must be at least 10 characters' })
  @MaxLength(500, { message: 'Question must not exceed 500 characters' })
  question: string;

  @IsArray({ message: 'Options must be an array' })
  @ArrayMinSize(QUIZ_OPTIONS_MIN, { message: `Each question must have at least ${QUIZ_OPTIONS_MIN} options` })
  @ArrayMaxSize(QUIZ_OPTIONS_MAX, { message: `Each question can have maximum ${QUIZ_OPTIONS_MAX} options` })
  @IsString({ each: true, message: 'Each option must be a string' })
  options: string[];

  @IsArray({ message: 'Correct answers must be an array' })
  @IsInt({ each: true, message: 'Each correct answer must be a number' })
  @ArrayMinSize(1, { message: 'At least one correct answer is required' })
  @ArrayMaxSize(QUIZ_CORRECT_ANSWERS_MAX, { message: `Maximum ${QUIZ_CORRECT_ANSWERS_MAX} correct answers allowed` })
  @ValidateCorrectAnswers()
  correctAnswers: number[];

  @IsBoolean({ message: 'isMultiSelect must be a boolean' })
  @IsOptional()
  isMultiSelect?: boolean;
}
