export const CompaniesRoutes = {
  ROOT: 'companies',
  BY_SLUG: ':slug',
  INVITATIONS: ':slug/invitations',
  INVITATION_BY_USER: ':slug/invitations/:userId',
  ACCEPT_INVITATION: ':slug/invitations/accept',
  DECLINE_INVITATION: ':slug/invitations/decline',
  JOIN_REQUESTS: ':slug/join-requests',
  ACCEPT_JOIN_REQUEST: ':slug/join-requests/:userId/accept',
  DECLINE_JOIN_REQUEST: ':slug/join-requests/:userId/decline',
  MEMBERS: ':slug/members',
  MEMBER_BY_ID: ':slug/members/:userId',
  LEAVE_COMPANY: ':slug/leave',
} as const;
