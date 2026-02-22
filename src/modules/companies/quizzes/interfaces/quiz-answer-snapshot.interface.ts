export interface QuizAnswerRecord {
  questionIndex: number;
  questionText: string;
  options: string[];
  selectedAnswers: number[];
  correctAnswers: number[];
  isCorrect: boolean;
  questionScore: number;
}

export interface QuizAnswerSnapshot {
  attemptId: string;
  userId: string;
  companyId: string;
  quizId: string;
  quizTitle: string;
  completedAt: string;
  totalPoints: number;
  maxPossiblePoints: number;
  answers: QuizAnswerRecord[];
}
