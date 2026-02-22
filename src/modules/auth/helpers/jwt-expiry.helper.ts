export function parseJwtExpiry(value: string): number {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 3600;
  }

  const amount = parseInt(match[1], 10);
  const unit = match[2];

  const multipliers: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
  };

  return amount * (multipliers[unit] ?? 3600);
}
