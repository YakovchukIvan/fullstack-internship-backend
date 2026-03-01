import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const AnalyticsSwagger: Record<string, Partial<OperationObject>> = {
  ME: {
    summary: 'Get personal analytics overview',
    description: 'Returns streak, performance distribution and score dynamics for current user.',
  },
  ME_STREAK: {
    summary: 'Get personal streak',
    description: 'Returns current streak, longest streak and whether user completed a quiz today.',
  },
  ME_DURATION: {
    summary: 'Get personal duration stats',
    description: 'Returns average, best and worst quiz duration with dynamics over time.',
  },
  ME_DYNAMICS: {
    summary: 'Get personal score dynamics',
    description: 'Returns score dynamics grouped by date. Supports ?from and ?to filters.',
  },
  ME_PERFORMANCE: {
    summary: 'Get personal performance distribution',
    description: 'Returns count and percent of attempts per performance level (POOR → PERFECT).',
  },
  COMPANY_LEADERBOARD: {
    summary: 'Get company leaderboard table',
    description: 'Returns full leaderboard with rating, attempts, duration per member. Requires OWNER or ADMIN.',
  },
  COMPANY_DYNAMICS: {
    summary: 'Get company score dynamics',
    description: 'Returns average score dynamics for all users in company over time. Requires OWNER or ADMIN.',
  },
  COMPANY_USER_DYNAMICS: {
    summary: 'Get specific user dynamics in company',
    description: 'Returns score dynamics for a specific user in the company. Requires OWNER or ADMIN.',
  },
};
