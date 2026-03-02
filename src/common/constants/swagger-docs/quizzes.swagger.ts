import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const QuizzesSwagger: Record<string, Partial<OperationObject>> = {
  FIND_ALL: {
    summary: 'Get all quizzes',
    description: 'Returns paginated list of quizzes for the company. All members can view.',
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

export const QuizSessionSwagger: Record<string, Partial<OperationObject>> = {
  START: {
    summary: 'Start quiz',
    description:
      'Returns full quiz details with questions and options. Starts the time limit timer in Redis. Available to all company members.',
  },
  SUBMIT: {
    summary: 'Submit quiz answers',
    description:
      'Submits answers for a quiz. Validates time limit and frequency. Calculates score and saves result to DB + Redis (48h). Available to all company members.',
  },
  ME_ATTEMPTS: {
    summary: 'Get my attempts',
    description:
      'Returns all quiz attempts for the current user for a specific quiz from Redis (48h window). Available to all company members.',
  },
  MEMBER_ATTEMPTS: {
    summary: 'Get member attempts',
    description:
      'Returns all quiz attempts for a specific company member for a specific quiz from Redis (48h window). Requires company OWNER or company ADMIN.',
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
