export abstract class CompanyBaseEvent {
  constructor(
    public readonly userId: string,
    public readonly userName: string,
    public readonly companyId: string,
    public readonly companyName: string,
  ) {}
}
