export function toDateOnly(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function parseDateFilter(from?: string, to?: string): { from?: Date; to?: Date } {
  return {
    from: from ? new Date(from) : undefined,
    to: to ? new Date(to) : undefined,
  };
}
