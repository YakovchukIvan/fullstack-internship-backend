export class QuizQuestionResponseDto {
  question: string;
  options: string[];
  correctAnswers: number[];
  isMultiSelect: boolean;
}

export class QuizResponseDto {
  id: string;
  title: string;
  description: string | null;
  frequencyInDays: number;
  questions: QuizQuestionResponseDto[];
  companyId: string;
  isAiGenerated: boolean;
  aiPrompt: string | null;
  createdAt: string;
  updatedAt: string;
}
