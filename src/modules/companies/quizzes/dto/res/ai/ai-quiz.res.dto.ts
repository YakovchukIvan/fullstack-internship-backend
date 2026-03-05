import { QuizWithQuestionsDto } from '../quiz/quiz-session.res.dto';

export class AiQuotaResponseDto {
  remaining: number;
  limit: number;
  resetsAt: string;
}

export class QuizAiResponseDto extends QuizWithQuestionsDto {
  quotaRemaining: number | null;
}
