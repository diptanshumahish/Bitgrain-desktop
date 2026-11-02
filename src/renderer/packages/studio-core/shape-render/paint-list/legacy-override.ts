const FILL_KEYS = ["fill", "fillGradient", "fillImage"];
const STROKE_KEYS = ["stroke", "strokeColor", "strokeWidth", "strokeAlign"];

const touches = (patch: object, keys: string[]): boolean => keys.some((key) => key in patch);

export const legacyPaintOverride = <T extends object>(patch: T): T => ({
  ...patch,
  ...(touches(patch, FILL_KEYS) && !("fills" in patch) ? { fills: undefined } : {}),
  ...(touches(patch, STROKE_KEYS) && !("strokes" in patch) ? { strokes: undefined } : {}),
});
