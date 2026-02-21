export const REDIS_TTL = {
  ACCESS_TOKEN: 15 * 60, // 15 min
  REFRESH_TOKEN: 7 * 24 * 3600, // 7 days
  QUIZ_ANSWERS: 48 * 3600, // 48 hours
} as const;

export const RedisKeys = {
  accessToken: (userId: string, jti: string): string => `auth:access:${userId}:${jti}`,

  refreshToken: (userId: string, jti: string): string => `auth:refresh:${userId}:${jti}`,

  allUserAccessTokens: (userId: string): string => `auth:access:${userId}:*`,

  allUserRefreshTokens: (userId: string): string => `auth:refresh:${userId}:*`,

  quizAnswers: (userId: string, attemptId: string): string => `quiz:answers:${userId}:${attemptId}`,

  allUserQuizAnswers: (userId: string): string => `quiz:answers:${userId}:*`,

  allQuizAnswers: (): string => 'quiz:answers:*',
};
