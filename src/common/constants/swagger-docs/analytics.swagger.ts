import { OperationObject } from '@nestjs/swagger/dist/interfaces/open-api-spec.interface';

export const AnalyticsSwagger: Record<string, Partial<OperationObject>> = {
  ME_COMPANY: {
    summary: 'Get my analytics in company',
    description:
      'Returns full personal analytics for current user in specific company: streak, rating, dynamics, performance distribution, duration stats and last 10 attempts.',
  },
  ME_COMPANY_QUIZZES: {
    summary: 'Get my quizzes in company',
    description:
      'Returns list of quizzes completed by current user in specific company with total attempts, last completion date, best and average accuracy.',
  },
  ME_COMPANY_DURATION_DYNAMICS: {
    summary: 'Get my duration dynamics in company',
    description: 'Returns the duration dynamics of quiz attempts for the current user in a specific company.',
  },
  COMPANY_LEADERBOARD: {
    summary: 'Get company leaderboard',
    description:
      'Returns leaderboard table with rating, attempts count and average duration per member. Requires OWNER or ADMIN.',
  },
  COMPANY_DYNAMICS: {
    summary: 'Get company score dynamics',
    description:
      'Returns average score dynamics for all users in company grouped by day. Supports ?from and ?to filters. Requires OWNER or ADMIN.',
  },
  COMPANY_USER_PROFILE: {
    summary: 'Get user analytics profile',
    description:
      'Returns full analytics profile for specific company member: streak, rating, dynamics, performance, duration and last attempts. Requires OWNER or ADMIN.',
  },
  COMPANY_USER_QUIZZES: {
    summary: 'Get user quizzes in company',
    description: 'Returns list of quizzes completed by specific user in company. Requires OWNER or ADMIN.',
  },
  COMPANY_QUIZ_ATTEMPTS: {
    summary: 'Get quiz attempts overview',
    description: 'Returns list of all members who attempted specific quiz with their stats. Requires OWNER or ADMIN.',
  },
};
