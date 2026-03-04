import { QuizBaseResponseDto } from './quiz-base.res.dto';
import { QuizQuestionAdminResponseDto } from './quiz-question.res.dto';
import { QuizWithQuestionsDto } from './quiz-session.res.dto';

export class QuizResponseDto extends QuizWithQuestionsDto {}

export class QuizAdminResponseDto extends QuizBaseResponseDto {
  questions: QuizQuestionAdminResponseDto[];
}
