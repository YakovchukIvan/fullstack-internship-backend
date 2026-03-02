export const QuizzesRoutes = {
  ROOT: 'companies/:slug/quizzes',
  BY_ID: ':quizId',
  GENERATE_AI: 'generate',
  AI_QUOTA: 'ai/quota',
  SESSION: {
    START: ':quizId',
    SUBMIT: ':quizId/attempts',
    ME_ATTEMPTS: ':quizId/attempts/me',
    MEMBER_ATTEMPTS: ':quizId/attempts/members/:userId',
  },
  EXPORT: {
    COMPANY: 'export/company',
    USER: 'export/users/:userId',
  },
} as const;
