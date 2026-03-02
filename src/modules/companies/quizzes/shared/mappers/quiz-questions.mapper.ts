import { QuizQuestionDto } from '../../dto/req/quiz-question.dto';
import { QuizQuestion } from '../interfaces/quiz.interfaces';

export function mapToQuizQuestions(questions: QuizQuestionDto[]): QuizQuestion[] {
  return questions.map((q) => ({
    question: q.question,
    options: q.options,
    correctAnswers: q.correctAnswers,
  }));
}
