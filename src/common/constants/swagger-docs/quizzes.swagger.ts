import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const QuizzesSwagger: Record<string, Partial<OperationObject>> = {
  FIND_ALL: {
    summary: 'Get all quizzes',
    description: 'Returns paginated list of quizzes for the company. All members can view.',
  },
  FIND_ONE: {
    summary: 'Get quiz by ID',
    description:
      'Returns full quiz details including all questions and answer options. Requires company OWNER or company ADMIN.',
  },
  CREATE: {
    summary: 'Create quiz',
    description:
      'Creates a new quiz. Min 2 questions, min 2 options per question. Requires company OWNER or company ADMIN.',
  },
  UPDATE: {
    summary: 'Update quiz',
    description: 'Updates quiz metadata and/or questions. Requires company OWNER or company ADMIN.',
  },
  REMOVE: {
    summary: 'Delete quiz',
    description: 'Permanently deletes the quiz and all its data. Requires company OWNER or company ADMIN.',
  },
};

export const QuizzesAiSwagger: Record<string, Partial<OperationObject>> = {
  AI_QUOTA: {
    summary: 'Get AI quota',
    description:
      'Returns remaining AI quiz generation quota for today and reset time. Requires company OWNER or company ADMIN.',
  },
  GENERATE_AI: {
    summary: 'Generate quiz with AI',
    description:
      'Generates a quiz using Gemini AI from a text prompt. Subject to daily rate limit. Requires company OWNER or company ADMIN.',
  },
};

export const QuizAttemptsSwagger: Record<string, Partial<OperationObject>> = {
  SUBMIT_ATTEMPT: {
    summary: 'Submit quiz answers',
    description:
      'Submits answers for a quiz. Validates frequency limit. Calculates score and saves result to DB + Redis (48h).',
  },
};

export const QuizExportSwagger: Record<string, Partial<OperationObject>> = {
  EXPORT_COMPANY: {
    summary: 'Export all company results',
    description:
      'Exports quiz answers for all users in the company from Redis. Supports ?format=json|csv and date filters from/to. Requires company OWNER or company ADMIN.',
  },
  EXPORT_USER: {
    summary: 'Export specific user results',
    description:
      'Exports quiz answers for a specific member in the company. Supports ?format=json|csv and ?quizId filter. Requires company OWNER or company ADMIN.',
  },
};
