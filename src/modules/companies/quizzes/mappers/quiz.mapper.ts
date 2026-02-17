import { Quiz } from '../entities/quiz.entity';
import { QuizResponseDto } from '../dto/res/quiz.res.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toQuizResponseDto(quiz: Quiz): QuizResponseDto {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    frequencyInDays: quiz.frequencyInDays,
    questions: quiz.questions,
    companyId: quiz.companyId,
    isAiGenerated: quiz.isAiGenerated,
    aiPrompt: quiz.aiPrompt,
    createdAt: toIso(quiz.createdAt),
    updatedAt: toIso(quiz.updatedAt),
  };
}
