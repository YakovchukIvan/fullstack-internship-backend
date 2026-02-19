import { Quiz } from '../entities/quiz.entity';
import { QuizResponseDto } from '../dto/res/quiz.res.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toQuizResponseDto(quiz: Quiz, quotaRemaining?: number): QuizResponseDto {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    frequencyInDays: quiz.frequencyInDays,
    questions: quiz.questions,
    createdByUserId: quiz.createdByUserId,
    createdBy: {
      displayName: quiz.createdBySnapshot.displayName,
      role: quiz.createdBySnapshot.role,
    },
    isAiGenerated: quiz.isAiGenerated,
    aiPrompt: quiz.aiPrompt,
    createdAt: toIso(quiz.createdAt),
    updatedAt: toIso(quiz.updatedAt),
    quotaRemaining: quotaRemaining ?? null,
  };
}
