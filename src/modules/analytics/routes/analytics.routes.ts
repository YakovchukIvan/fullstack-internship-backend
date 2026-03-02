export const AnalyticsRoutes = {
  ROOT: 'analytics',

  ME_COMPANY: 'me/companies/:slug',
  ME_COMPANY_QUIZZES: 'me/companies/:slug/quizzes',
  ME_COMPANY_DURATION_DYNAMICS: 'me/companies/:slug/duration-dynamics',

  COMPANY_LEADERBOARD: 'companies/:slug/leaderboard',
  COMPANY_DYNAMICS: 'companies/:slug/dynamics',

  COMPANY_USER_PROFILE: 'companies/:slug/users/:userId',
  COMPANY_USER_QUIZZES: 'companies/:slug/users/:userId/quizzes',

  COMPANY_QUIZ_ATTEMPTS: 'companies/:slug/quizzes/:quizId/attempts',
} as const;
