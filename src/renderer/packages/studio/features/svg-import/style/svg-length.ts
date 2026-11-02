const PERCENT_DIVISOR = 100;
const UNIT_TO_PX: Readonly<Record<string, number>> = {
  "": 1,
  px: 1,
  pt: 4 / 3,
  pc: 16,
  in: 96,
  cm: 96 / 2.54,
  mm: 96 / 25.4,
  em: 16,
  rem: 16,
};
const LENGTH_PATTERN = /^([-+]?(?:\d+\.?\d*|\.\d+)(?:e[-+]?\d+)?)\s*([a-z%]*)$/i;

export const parseLength = (raw: string | null | undefined, reference: number, fallback: number): number => {
  if (raw === null || raw === undefined) return fallback;
  const match = LENGTH_PATTERN.exec(raw.trim());
  if (!match) return fallback;
  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  if (unit === "%") return (value / PERCENT_DIVISOR) * reference;
  const factor = UNIT_TO_PX[unit];
  return factor === undefined ? fallback : value * factor;
};

export const parseFraction = (raw: string | null | undefined, fallback: number): number => {
  if (raw === null || raw === undefined || raw.trim() === "") return fallback;
  const trimmed = raw.trim();
  const value = parseFloat(trimmed);
  if (!Number.isFinite(value)) return fallback;
  return trimmed.endsWith("%") ? value / PERCENT_DIVISOR : value;
};
