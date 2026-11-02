const MAX_SIMPLE_RATIO_TERM = 32;

const greatestCommonDivisor = (first: number, second: number): number =>
  second === 0 ? first : greatestCommonDivisor(second, first % second);

export const formatSize = (width: number, height: number): string =>
  `${Math.round(width)} × ${Math.round(height)}`;

export const formatRatio = (width: number, height: number): string => {
  const roundedWidth = Math.round(width);
  const roundedHeight = Math.round(height);
  if (roundedWidth <= 0 || roundedHeight <= 0) return "n/a";
  const divisor = greatestCommonDivisor(roundedWidth, roundedHeight);
  const ratioWidth = roundedWidth / divisor;
  const ratioHeight = roundedHeight / divisor;
  if (ratioWidth <= MAX_SIMPLE_RATIO_TERM && ratioHeight <= MAX_SIMPLE_RATIO_TERM) return `${ratioWidth}:${ratioHeight}`;
  return `${(roundedWidth / roundedHeight).toFixed(2)}:1`;
};
