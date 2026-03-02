import { IsString, IsNotEmpty, IsEnum, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';
import { QuizDifficulty } from '../../enums/quiz-difficulty.enum';
import { QuizConfig } from '../../constants/quiz.constants';

export class GenerateQuizAiDto {
  @IsString({ message: 'Topic must be a string' })
  @IsNotEmpty({ message: 'Topic is required' })
  @MinLength(2, { message: 'Topic must be at least 2 characters' })
  @MaxLength(200, { message: 'Topic must not exceed 200 characters' })
  topic: string;

  @IsEnum(QuizDifficulty, { message: 'Difficulty must be easy, medium, or hard' })
  difficulty: QuizDifficulty;

  @IsInt({ message: 'Questions count must be a number' })
  @Min(QuizConfig.QUESTIONS.MIN, { message: `Quiz must have at least ${QuizConfig.QUESTIONS.MIN} questions` })
  @Max(QuizConfig.QUESTIONS.MAX, { message: `Maximum ${QuizConfig.QUESTIONS.MAX} questions for AI generation` })
  questionsCount: number;

  @IsInt({ message: 'Frequency must be a number' })
  @Min(1, { message: 'Frequency must be at least 1 day' })
  @Max(365, { message: 'Frequency must not exceed 365 days' })
  frequencyInDays: number;

  @IsInt({ message: 'Time limit must be a number' })
  @Min(20, { message: 'Time limit must be at least 20 minutes' })
  @Max(120, { message: 'Time limit must not exceed 120 minutes' })
  timeLimitMinutes: number;
}
