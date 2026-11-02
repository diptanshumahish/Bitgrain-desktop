const QUARTER_TURN_DEG = 90;
const HALF_QUARTER_DEG = 45;
const DEG_TO_RAD = Math.PI / 180;

export interface CornerParams {
  a: number;
  b: number;
  c: number;
  d: number;
  p: number;
  arc: number;
  radius: number;
}

const toRadians = (degrees: number): number => degrees * DEG_TO_RAD;

export const cornerParams = (cornerRadius: number, smoothingRatio: number, budget: number): CornerParams => {
  const radius = Math.max(0, Math.min(cornerRadius, budget));
  if (radius <= 0) return { a: 0, b: 0, c: 0, d: 0, p: 0, arc: 0, radius: 0 };
  const maxSmoothing = budget / radius - 1;
  const smoothing = Math.max(0, Math.min(smoothingRatio, maxSmoothing));
  const p = Math.min((1 + smoothing) * radius, budget);
  const arcMeasure = QUARTER_TURN_DEG * (1 - smoothing);
  const arc = Math.sin(toRadians(arcMeasure / 2)) * radius * Math.SQRT2;
  const angleAlpha = (QUARTER_TURN_DEG - arcMeasure) / 2;
  const tangentDistance = radius * Math.tan(toRadians(angleAlpha / 2));
  const angleBeta = HALF_QUARTER_DEG * smoothing;
  const c = tangentDistance * Math.cos(toRadians(angleBeta));
  const d = c * Math.tan(toRadians(angleBeta));
  const b = (p - arc - c - d) / 3;
  return { a: 2 * b, b, c, d, p, arc, radius };
};
