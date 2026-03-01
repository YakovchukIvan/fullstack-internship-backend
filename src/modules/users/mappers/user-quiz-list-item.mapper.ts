import { Quiz } from '@/modules/companies/quizzes/entities/quiz.entity';
import { UserQuizListItemResponseDto } from '../dto/res/quizzes/user-quizzes-list.res.dto';
import { toIso } from '@/common/helpers/date.transformer';

export function toUserQuizListItemResponseDto(quiz: Quiz): UserQuizListItemResponseDto {
  return {
    id: quiz.id,
    title: quiz.title,
    companyName: quiz.company.name,
    slug: quiz.company.slug,
    isAiGenerated: quiz.isAiGenerated,
    aiPrompt: quiz.aiPrompt,
    createdAt: toIso(quiz.createdAt),
    updatedAt: toIso(quiz.updatedAt),
  };
}
