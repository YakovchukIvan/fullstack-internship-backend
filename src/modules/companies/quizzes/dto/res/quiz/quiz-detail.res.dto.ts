import { QuizBaseResponseDto } from '../quiz-base.res.dto';
import { QuizQuestionAdminResponseDto } from './quiz-question.res.dto';

export class QuizAdminResponseDto extends QuizBaseResponseDto {
  questions: QuizQuestionAdminResponseDto[];
}
