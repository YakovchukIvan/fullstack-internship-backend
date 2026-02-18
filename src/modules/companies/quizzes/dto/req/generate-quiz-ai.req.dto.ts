import { IsString, IsNotEmpty, IsEnum, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';
import { QuizDifficulty } from '../../enums/quiz-difficulty.enum';

export class GenerateQuizAiDto {
  @IsString({ message: 'Topic must be a string' })
  @IsNotEmpty({ message: 'Topic is required' })
  @MinLength(2, { message: 'Topic must be at least 3 characters' })
  @MaxLength(200, { message: 'Topic must not exceed 100 characters' })
  topic: string;

  @IsEnum(QuizDifficulty, { message: 'Difficulty must be easy, medium, or hard' })
  difficulty: QuizDifficulty;

  @IsInt({ message: 'Questions count must be a number' })
  @Min(2, { message: 'Quiz must have at least 2 questions' })
  @Max(20, { message: 'Maximum 20 questions for AI generation' })
  questionsCount: number;

  @IsInt({ message: 'Frequency must be a number' })
  @Min(1, { message: 'Frequency must be at least 1 day' })
  @Max(365, { message: 'Frequency must not exceed 365 days' })
  frequencyInDays: number;
}
