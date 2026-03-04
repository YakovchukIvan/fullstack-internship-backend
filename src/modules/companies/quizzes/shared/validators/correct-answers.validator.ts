import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';
import { QuizQuestionDto } from '../../dto/req/quiz/quiz-question.dto';

export function ValidateCorrectOptionIndexes(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'validateCorrectOptionIndexes',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: unknown, args: ValidationArguments): boolean {
          if (!Array.isArray(value)) {
            return false;
          }

          const question = args.object as QuizQuestionDto;
          const correctOptionIndexes = value as number[];

          if (!question.options || !Array.isArray(question.options)) {
            return false;
          }

          const allValid = correctOptionIndexes.every(
            (idx) => Number.isInteger(idx) && idx >= 0 && idx < question.options.length,
          );
          if (!allValid) {
            return false;
          }

          const unique = new Set(correctOptionIndexes);
          if (unique.size !== correctOptionIndexes.length) {
            return false;
          }

          if (correctOptionIndexes.length > question.options.length) {
            return false;
          }

          return true;
        },
        defaultMessage(_args: ValidationArguments): string {
          return 'Correct answers must be valid unique indices corresponding to the provided options';
        },
      },
    });
  };
}
