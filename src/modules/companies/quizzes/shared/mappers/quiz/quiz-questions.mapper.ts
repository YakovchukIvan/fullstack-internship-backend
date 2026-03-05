import {
  QuizQuestionAdminResponseDto,
  QuizQuestionResponseDto,
} from '@/modules/companies/quizzes/dto/res/quiz/quiz-question.res.dto';
import { QuizQuestionDto } from '@/modules/companies/quizzes/dto/req/quiz/quiz-question.dto';
import { QuizQuestion } from '../../interfaces/quiz.interfaces';

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
