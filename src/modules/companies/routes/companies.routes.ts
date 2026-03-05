export const CompaniesRoutes = {
  ROOT: 'companies',
  BY_SLUG: ':slug',

  INVITATIONS: {
    ME: 'invitations/me',
    BASE: ':slug/invitations',
    BY_ID: ':slug/invitations/:invitationId',
    ACCEPT: ':slug/invitations/accept',
    DECLINE: ':slug/invitations/decline',
  },

  JOIN_REQUESTS: {
    ME: 'join-requests/me',
    BASE: ':slug/join-requests',
    ACCEPT: ':slug/join-requests/:requestId/accept',
    DECLINE: ':slug/join-requests/:requestId/decline',
  },

  MEMBERS: {
    ME: 'members/me',
    BASE: ':slug/members',
    BY_ID: ':slug/members/:memberId',
    UPDATE_ROLE: ':slug/members/:memberId/role',
  },

  LEADERBOARD: ':slug/leaderboard',
  LEAVE: ':slug/leave',
} as const;
