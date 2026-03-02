import { Quiz } from '../../entities/quiz.entity';
import { QuizResponseDto, QuizStartResponseDto } from '../../dto/res/quiz.res.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toQuizResponseDto(quiz: Quiz, quotaRemaining?: number): QuizResponseDto {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    frequencyInDays: quiz.frequencyInDays,
    timeLimitMinutes: quiz.timeLimitMinutes,
    questions: quiz.questions.map((q) => ({
      question: q.question,
      options: q.options,
    })),
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

export function toQuizStartResponseDto(quiz: Quiz, startedAt: Date): QuizStartResponseDto {
  return {
    ...toQuizResponseDto(quiz),
    startedAt: toIso(startedAt),
  };
}
