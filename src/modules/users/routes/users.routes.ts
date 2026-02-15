export const UsersRoutes = {
  ROOT: 'users',
  ME: 'me',
  ID: ':id',
  COMPANY: {
    ROOT: 'me/company',
    INVITATIONS: 'invitations',
    JOIN_REQUESTS: 'join-requests',
    MEMBERSHIP: 'membership',
  },
} as const;
