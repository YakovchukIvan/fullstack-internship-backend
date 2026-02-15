export const CompaniesRoutes = {
  ROOT: 'companies',
  BY_SLUG: ':slug',

  INVITATIONS: {
    BASE: ':slug/invitations',
    BY_ID: ':slug/invitations/:invitationId',
    ACCEPT: ':slug/invitations/accept',
    DECLINE: ':slug/invitations/decline',
  },

  JOIN_REQUESTS: {
    BASE: ':slug/join-requests',
    ACCEPT: ':slug/join-requests/:requestId/accept',
    DECLINE: ':slug/join-requests/:requestId/decline',
  },

  MEMBERS: {
    BASE: ':slug/members',
    BY_ID: ':slug/members/:memberId',
    UPDATE_ROLE: ':slug/members/:memberId/role',
  },

  LEAVE: ':slug/leave',
} as const;
