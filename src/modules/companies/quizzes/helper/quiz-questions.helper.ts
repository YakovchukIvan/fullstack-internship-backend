import { BadRequestException } from '@nestjs/common';
import { QuizQuestionDto } from '../dto/req/quiz-question.dto';
import { QuizQuestion } from '../interfaces/quiz.interfaces';
import {
  QUIZ_CORRECT_ANSWERS_MAX,
  QUIZ_CORRECT_ANSWERS_MIN_MULTI,
  QUIZ_OPTIONS_MIN,
  QUIZ_OPTIONS_MAX,
} from '../constants/quiz.constants';

export function validateQuizQuestions(questions: QuizQuestionDto[] | QuizQuestion[]): void {
  questions.forEach((q, index) => {
    if (!Array.isArray(q.options) || q.options.length < QUIZ_OPTIONS_MIN || q.options.length > QUIZ_OPTIONS_MAX) {
      throw new BadRequestException(
        `Question ${index + 1}: Must have between ${QUIZ_OPTIONS_MIN} and ${QUIZ_OPTIONS_MAX} options`,
      );
    }

    if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
      throw new BadRequestException(`Question ${index + 1}: correctAnswers must be a non-empty array`);
    }

    q.correctAnswers.forEach((idx) => {
      if (idx < 0 || idx >= q.options.length) {
        throw new BadRequestException(
          `Question ${index + 1}: correctAnswer index ${idx} is out of range (0-${q.options.length - 1})`,
        );
      }
    });

    const isMultiSelect = q.isMultiSelect ?? false;

    if (!isMultiSelect && q.correctAnswers.length !== 1) {
      throw new BadRequestException(`Question ${index + 1}: Single-select question must have exactly 1 correct answer`);
    }

    if (
      isMultiSelect &&
      (q.correctAnswers.length < QUIZ_CORRECT_ANSWERS_MIN_MULTI || q.correctAnswers.length > QUIZ_CORRECT_ANSWERS_MAX)
    ) {
      throw new BadRequestException(
        `Question ${index + 1}: Multi-select question must have between 
        ${QUIZ_CORRECT_ANSWERS_MIN_MULTI} and ${QUIZ_CORRECT_ANSWERS_MAX} correct answers`,
      );
    }
  });
}
