export const QuizzesRoutes = {
  ROOT: 'companies/:slug/quizzes',
  BY_ID: ':quizId',
  GENERATE_AI: 'generate',
  AI_QUOTA: 'ai/quota',
  SESSION: {
    START: ':quizId/start',
    SUBMIT: ':quizId/attempts',
  },
  ATTEMPTS: {
    ME: ':quizId/attempts/me',
    MEMBER: ':quizId/attempts/members/:userId',
    RATING: 'attempts/rating',
  },
  AVAILABLE: 'available',
  EXPORT: {
    COMPANY: 'export/company',
    USER: 'export/users/:userId',
    ME: 'export/me',
  },
} as const;
