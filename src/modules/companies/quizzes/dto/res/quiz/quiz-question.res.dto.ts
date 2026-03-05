export class QuizQuestionResponseDto {
  question: string;
  options: string[];
}

export class QuizQuestionAdminResponseDto extends QuizQuestionResponseDto {
  correctOptionIndexes: number[];
}
