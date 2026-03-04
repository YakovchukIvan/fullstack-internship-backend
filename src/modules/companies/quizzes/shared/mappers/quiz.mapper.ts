import { Quiz } from '../../entities/quiz.entity';
import { QuizStartResponseDto } from '../../dto/res/quiz-session.res.dto';
import { toIso } from '@/common/helpers/date.transformer';
import { toQuizQuestionsWithAnswers, toQuizQuestionsWithoutAnswers } from './quiz-questions.mapper';
import { QuizAdminResponseDto, QuizResponseDto } from '../../dto/res/quiz-detail.res.dto';
import { QuizListResponseDto } from '../../dto/res/quizzes-paginated.res.dto';

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

export function toQuizResponseDto(quiz: Quiz): QuizResponseDto {
  return toQuizPublicFields(quiz);
}

export function toQuizListResponseDto(quiz: Quiz): QuizListResponseDto {
  return {
    ...toQuizBaseFields(quiz),
    questions: toQuizQuestionsWithoutAnswers(quiz.questions),
  };
}

export function toQuizStartResponseDto(quiz: Quiz, startedAt: Date): QuizStartResponseDto {
  return {
    ...toQuizPublicFields(quiz),
    startedAt: toIso(startedAt),
  };
}

export function toQuizAdminResponseDto(quiz: Quiz): QuizAdminResponseDto {
  return {
    ...toQuizBaseFields(quiz),
    questions: toQuizQuestionsWithAnswers(quiz.questions),
  };
}
