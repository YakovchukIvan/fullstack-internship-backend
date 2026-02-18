export const QuizzesRoutes = {
  ROOT: 'companies/:slug/quizzes',
  BY_ID: ':quizId',
  GENERATE_AI: 'generate',
  AI_QUOTA: 'ai/quota',
  ATTEMPTS: {
    BASE: ':quizId/attempts',
    MY: ':quizId/attempts/my',
  },
} as const;
