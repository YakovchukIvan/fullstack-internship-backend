export const AnalyticsRoutes = {
  ROOT: 'analytics',

  ME: 'me',
  ME_STREAK: 'me/streak',
  ME_DURATION: 'me/duration',
  ME_DYNAMICS: 'me/dynamics',
  ME_PERFORMANCE: 'me/performance',

  COMPANY_LEADERBOARD: 'companies/:slug/leaderboard',
  COMPANY_DYNAMICS: 'companies/:slug/dynamics',
  COMPANY_USER_DYNAMICS: 'companies/:slug/users/:userId/dynamics',
} as const;
