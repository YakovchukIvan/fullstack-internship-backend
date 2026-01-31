export function normalizeEmail(input: string): string {
  if (typeof input !== 'string') {
    throw new TypeError('Email must be a string');
  }

  return input.trim().toLowerCase();
}
