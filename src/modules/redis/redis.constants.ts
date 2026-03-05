export const REDIS_TTL = {
  QUIZ_ANSWERS: 48 * 3600,
} as const;

export const RedisKeys = {
  accessToken: (userId: string, jti: string): string => `auth:access:${userId}:${jti}`,
  refreshToken: (userId: string, jti: string): string => `auth:refresh:${userId}:${jti}`,
  allUserAccessTokens: (userId: string): string => `auth:access:${userId}:*`,
  allUserRefreshTokens: (userId: string): string => `auth:refresh:${userId}:*`,
  quizAnswers: (userId: string, quizId: string, attemptId: string): string =>
    `quiz:answers:${userId}:${quizId}:${attemptId}`,
  allUserQuizAnswers: (userId: string): string => `quiz:answers:${userId}:*`,
  allUserQuizAnswersForQuiz: (userId: string, quizId: string): string => `quiz:answers:${userId}:${quizId}:*`,
  allQuizAnswers: (): string => 'quiz:answers:*',
  quizStart: (userId: string, quizId: string): string => `quiz:start:${userId}:${quizId}`,
};
