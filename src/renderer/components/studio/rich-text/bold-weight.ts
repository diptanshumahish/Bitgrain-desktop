const BOLD_THRESHOLD = 600;
const BOLD_WEIGHT = "700";
const REGULAR_WEIGHT = "400";

export const isBoldWeight = (weight: string | null): boolean => Number(weight) >= BOLD_THRESHOLD;

export const nextBoldWeight = (weight: string | null): string =>
  isBoldWeight(weight) ? REGULAR_WEIGHT : BOLD_WEIGHT;
