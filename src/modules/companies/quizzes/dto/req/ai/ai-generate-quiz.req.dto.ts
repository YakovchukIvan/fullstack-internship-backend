import { IsString, IsNotEmpty, IsEnum, IsInt, Min, Max, MinLength, MaxLength } from 'class-validator';
import { QuizBaseDto } from '../quiz-base.req.dto';
import { QuizDifficulty } from '@/modules/companies/quizzes/enums/quiz-difficulty.enum';
import { QuizConfig } from '@/modules/companies/quizzes/shared/constants/quiz.constants';

export class GenerateQuizAiDto extends QuizBaseDto {
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
}
