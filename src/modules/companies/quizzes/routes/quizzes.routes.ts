export const QuizzesRoutes = {
  ROOT: 'companies/:slug/quizzes',
  BY_ID: ':quizId',
  GENERATE_AI: 'generate',
  AI_QUOTA: 'ai/quota',
  ATTEMPTS: {
    BASE: ':quizId/attempts',
    MY: ':quizId/attempts/my',
  },
  EXPORT: {
    COMPANY: 'export/company',
    USER: 'export/users/:userId',
    QUIZ: 'export/quiz/:quizId',
  },
} as const;
