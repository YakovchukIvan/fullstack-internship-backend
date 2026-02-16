export const CompanyEvents = {
  INVITATION_SENT: 'company.invitation.sent',
  INVITATION_ACCEPTED: 'company.invitation.accepted',
  JOIN_REQUEST_CREATED: 'company.join_request.created',
  JOIN_REQUEST_ACCEPTED: 'company.join_request.accepted',
} as const;

export class CompanyInvitationEvent {
  constructor(
    public readonly recipientId: string,
    public readonly companyId: string,
    public readonly inviterId: string,
    public readonly invitationId?: string,
  ) {}
}

export class CompanyMembershipEvent {
  constructor(
    public readonly userId: string,
    public readonly companyId: string,
  ) {}
}
