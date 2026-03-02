import { BadRequestException } from '@nestjs/common';
import { QuizQuestionDto } from '../../dto/req/quiz-question.dto';
import { QuizQuestion } from '../interfaces/quiz.interfaces';
import { QuizConfig } from '../constants/quiz.constants';

export function validateQuizQuestions(questions: QuizQuestionDto[] | QuizQuestion[]): void {
  questions.forEach((q, index) => {
    if (
      !Array.isArray(q.options) ||
      q.options.length < QuizConfig.OPTIONS.MIN ||
      q.options.length > QuizConfig.OPTIONS.MAX
    ) {
      throw new BadRequestException(
        `Question ${index + 1}: Must have between ${QuizConfig.OPTIONS.MIN} and ${QuizConfig.OPTIONS.MAX} options`,
      );
    }

    if (!Array.isArray(q.correctAnswers) || q.correctAnswers.length === 0) {
      throw new BadRequestException(`Question ${index + 1}: correctAnswers must be a non-empty array`);
    }

    q.correctAnswers.forEach((idx) => {
      if (typeof idx !== 'number' || idx < 0 || idx >= q.options.length) {
        throw new BadRequestException(
          `Question ${index + 1}: correctAnswer index ${idx} is out of range (0-${q.options.length - 1})`,
        );
      }
    });

    const uniqueAnswers = new Set(q.correctAnswers);
    if (uniqueAnswers.size !== q.correctAnswers.length) {
      throw new BadRequestException(`Question ${index + 1}: correctAnswers must not contain duplicates`);
    }

    if (q.correctAnswers.length > q.options.length) {
      throw new BadRequestException(`Question ${index + 1}: Cannot have more correct answers than available options`);
    }
  });
}
