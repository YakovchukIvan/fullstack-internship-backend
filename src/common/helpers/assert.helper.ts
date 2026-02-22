import { BadRequestException, ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';

export class GuardAssertions {
  static exists<T>(value: T | null | undefined, message = 'Resource not found'): asserts value is T {
    if (!value) {
      throw new NotFoundException(message);
    }
  }

  static notExists<T>(
    value: T | null | undefined,
    message = 'Resource already exists',
  ): asserts value is null | undefined {
    if (value) {
      throw new ConflictException(message);
    }
  }

  static isTrue(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new NotFoundException(message);
    }
  }

  static isTrueBadRequest(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new BadRequestException(message);
    }
  }

  static isTrueConflict(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new ConflictException(message);
    }
  }

  static isTrueForbidden(condition: boolean, message: string): asserts condition {
    if (!condition) {
      throw new ForbiddenException(message);
    }
  }
}
