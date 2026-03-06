export class QuizCreatedEvent {
  constructor(
    public readonly quizId: string,
    public readonly quizTitle: string,
    public readonly companyId: string,
    public readonly createdByUserId: string,
    public readonly companyName: string,
  ) {}
}
