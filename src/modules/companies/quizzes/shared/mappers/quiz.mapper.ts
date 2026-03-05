import { toIso } from '@/common/helpers/date.transformer';
import { Quiz } from '../../entities/quiz.entity';
import { QuizStartResponseDto } from '../../dto/res/quiz/quiz-session.res.dto';
import { toQuizQuestionsWithAnswers, toQuizQuestionsWithoutAnswers } from './quiz/quiz-questions.mapper';
import { QuizAdminResponseDto } from '../../dto/res/quiz/quiz-detail.res.dto';
import { QuizListResponseDto } from '../../dto/res/quiz/quizzes-paginated.res.dto';

export function toQuizBaseFields(quiz: Quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    description: quiz.description,
    frequencyInDays: quiz.frequencyInDays,
    timeLimitMinutes: quiz.timeLimitMinutes,
    createdByUserId: quiz.createdByUserId,
    createdBy: {
      displayName: quiz.createdBySnapshot.displayName,
      role: quiz.createdBySnapshot.role,
    },
    isAiGenerated: quiz.isAiGenerated,
    aiPrompt: quiz.aiPrompt,
    createdAt: toIso(quiz.createdAt),
    updatedAt: toIso(quiz.updatedAt),
  };
}

export function toQuizPublicFields(quiz: Quiz) {
  return {
    ...toQuizBaseFields(quiz),
    questions: toQuizQuestionsWithoutAnswers(quiz.questions),
  };
}

export function toQuizListResponseDto(quiz: Quiz): QuizListResponseDto {
  return toQuizPublicFields(quiz);
}

export function toQuizAdminResponseDto(quiz: Quiz): QuizAdminResponseDto {
  return {
    ...toQuizBaseFields(quiz),
    questions: toQuizQuestionsWithAnswers(quiz.questions),
  };
}

export function toQuizStartResponseDto(quiz: Quiz, startedAt: Date): QuizStartResponseDto {
  return {
    ...toQuizPublicFields(quiz),
    startedAt: toIso(startedAt),
  };
}
