import { Transform } from 'class-transformer';

export function NormalizeEmail(): PropertyDecorator {
  return Transform(({ value }: { value: unknown }): unknown => {
    if (typeof value !== 'string') {
      return value;
    }
    return value.trim().toLowerCase();
  });
}
