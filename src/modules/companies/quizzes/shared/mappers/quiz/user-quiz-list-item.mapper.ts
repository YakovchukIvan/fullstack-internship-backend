import { Quiz } from '@/modules/companies/quizzes/entities/quiz.entity';
import { UserQuizListItemResponseDto } from '@/modules/companies/quizzes/dto/res/quiz/quizzes-paginated.res.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toUserQuizListItemResponseDto(quiz: Quiz): UserQuizListItemResponseDto {
  return {
    id: quiz.id,
    title: quiz.title,
    isAiGenerated: quiz.isAiGenerated,
    aiPrompt: quiz.aiPrompt,
    createdAt: toIso(quiz.createdAt),
    updatedAt: toIso(quiz.updatedAt),
  };
}
