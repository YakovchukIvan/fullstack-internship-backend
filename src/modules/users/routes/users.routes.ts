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
    RATING: 'rating',
    EXPORT: {
      ME: 'export/me',
    },
  },
} as const;
