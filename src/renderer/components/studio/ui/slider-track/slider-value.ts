const PAGE_STEP_MULTIPLIER = 10;

const decimalsOf = (step: number): number => {
  const [, fraction] = String(step).split(".");
  return fraction?.length ?? 0;
};

export const snapToStep = (raw: number, min: number, max: number, step: number): number => {
  const stepped = Math.round((raw - min) / step) * step + min;
  const clamped = Math.min(max, Math.max(min, stepped));
  return Number(clamped.toFixed(decimalsOf(step)));
};

const KEY_STEPS: Record<string, number> = {
  ArrowRight: 1,
  ArrowUp: 1,
  ArrowLeft: -1,
  ArrowDown: -1,
  PageUp: PAGE_STEP_MULTIPLIER,
  PageDown: -PAGE_STEP_MULTIPLIER,
};

export const valueForKey = (
  key: string,
  value: number,
  min: number,
  max: number,
  step: number,
): number | null => {
  if (key === "Home") return min;
  if (key === "End") return max;
  const steps = KEY_STEPS[key];
  if (steps === undefined) return null;
  return snapToStep(value + steps * step, min, max, step);
};
