export class CompanyMembershipEvent {
  constructor(
    public readonly userId: string,
    public readonly companyId: string,
    public readonly companyName: string,
  ) {}
}
