const STAGGER_MS = 35;
const MAX_STAGGER_STEPS = 12;

export const staggerDelay = (index: number): string => `${Math.min(index, MAX_STAGGER_STEPS) * STAGGER_MS}ms`;
