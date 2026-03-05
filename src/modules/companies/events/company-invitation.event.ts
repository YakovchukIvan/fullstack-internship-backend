export class CompanyInvitationEvent {
  constructor(
    public readonly recipientId: string,
    public readonly companyId: string,
    public readonly inviterId: string,
    public readonly companyName: string,
    public readonly invitationId?: string,
  ) {}
}
