export const UsersRoutes = {
  ROOT: 'users',
  ME: 'me',
  ID: ':id',
  COMPANY: {
    ROOT: 'me/company',
    INVITATIONS: 'invitations',
    JOIN_REQUESTS: 'join-requests',
    MEMBERSHIP: 'membership',
    QUIZZES: 'quizzes',
  },
  RATING: 'me/rating',
} as const;
