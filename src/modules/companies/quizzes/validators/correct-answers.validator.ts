import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { QuizQuestionDto } from '../dto/req/create-quiz.req.dto';

export function ValidateCorrectAnswers(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateCorrectAnswers',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (!Array.isArray(value)) {
            return false;
          }

          const question = args.object as QuizQuestionDto;
          const correctAnswers = value as number[];

          if (!question.options || !Array.isArray(question.options)) {
            return false;
          }

          const allValid = correctAnswers.every((idx) => idx >= 0 && idx < question.options.length);
          if (!allValid) {
            return false;
          }

          const unique = new Set(correctAnswers);
          if (unique.size !== correctAnswers.length) {
            return false;
          }

          const isMultiSelect = question.isMultiSelect ?? false;
          if (!isMultiSelect && correctAnswers.length !== 1) {
            return false;
          }

          if (isMultiSelect && correctAnswers.length < 2) {
            return false;
          }

          return true;
        },
        defaultMessage(args: ValidationArguments): string {
          const question = args.object as QuizQuestionDto;
          const isMultiSelect = question.isMultiSelect ?? false;

          if (isMultiSelect) {
            return 'Multi-select question must have 2-4 correct answers within options range';
          }
          return 'Single-select question must have exactly 1 correct answer within options range';
        },
      },
    });
  };
}
