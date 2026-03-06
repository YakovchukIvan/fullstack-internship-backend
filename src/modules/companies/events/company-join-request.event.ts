export class CompanyJoinRequestEvent {
  constructor(
    public readonly requesterId: string,
    public readonly requesterName: string,
    public readonly companyId: string,
    public readonly companyName: string,
  ) {}
}
