import { QuizAiResponseDto } from '../../dto/res/quiz-ai.res.dto';
import { Quiz } from '../../entities/quiz.entity';
import { toQuizPublicFields } from './quiz.mapper';

export function toQuizAiResponseDto(quiz: Quiz, quotaRemaining?: number): QuizAiResponseDto {
  return {
    ...toQuizPublicFields(quiz),
    quotaRemaining: quotaRemaining ?? null,
  };
}
