import { QuizBaseResponseDto } from './quiz-base.res.dto';
import { QuizQuestionResponseDto } from './quiz-question.res.dto';

export class QuizWithQuestionsDto extends QuizBaseResponseDto {
  questions: QuizQuestionResponseDto[];
}

export class QuizStartResponseDto extends QuizWithQuestionsDto {
  startedAt: string;
}
