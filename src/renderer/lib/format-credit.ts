export const formatCredit = (count: number): string =>
  Number.isFinite(count) ? String(count) : "∞";
