import { ConflictException, NotFoundException } from '@nestjs/common';

export class GuardAssertions {
  // GuardAssertions.exists - to check if an object/value exists
  static exists<T>(value: T | null | undefined, message = 'Resource not found'): asserts value is T {
    if (!value) {
      throw new NotFoundException(message);
    }
  }
  // Guard.notExists - to check if an object/value DOES NOT exist
  static notExists<T>(
    value: T | null | undefined,
    message = 'Resource already exists',
  ): asserts value is null | undefined {
    if (value) {
      throw new ConflictException(message);
    }
  }
  // Guard.isTrue - to check for boolean conditions
  static isTrue(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new NotFoundException(message);
    }
  }
}
