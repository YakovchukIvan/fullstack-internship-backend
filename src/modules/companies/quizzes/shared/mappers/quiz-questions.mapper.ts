import { QuizQuestionAdminResponseDto, QuizQuestionResponseDto } from '../../dto/res/quiz-question.res.dto';
import { QuizQuestionDto } from '../../dto/req/quiz-question.dto';
import { QuizQuestion } from '../interfaces/quiz.interfaces';

export function mapToQuizQuestions(questions: QuizQuestionDto[]): QuizQuestion[] {
  return questions.map((q) => ({
    question: q.question,
    options: q.options,
    correctOptionIndexes: q.correctOptionIndexes,
  }));
}

export function toQuizQuestionsWithoutAnswers(questions: QuizQuestion[]): QuizQuestionResponseDto[] {
  return questions.map((q) => ({
    question: q.question,
    options: q.options,
  }));
}

export function toQuizQuestionsWithAnswers(questions: QuizQuestion[]): QuizQuestionAdminResponseDto[] {
  return questions.map((q) => ({
    question: q.question,
    options: q.options,
    correctOptionIndexes: q.correctOptionIndexes,
  }));
}
