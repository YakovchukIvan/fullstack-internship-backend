import { QuizAiResponseDto } from '@/modules/companies/quizzes/dto/res/ai/ai-quiz.res.dto';
import { Quiz } from '@/modules/companies/quizzes/entities/quiz.entity';
import { toQuizPublicFields } from '../quiz.mapper';

export function toQuizAiResponseDto(quiz: Quiz, quotaRemaining?: number): QuizAiResponseDto {
  return {
    ...toQuizPublicFields(quiz),
    quotaRemaining: quotaRemaining ?? null,
  };
}
