import type { BezierCurve } from "../../model/animation-types";

const NEWTON_ITERATIONS = 8;
const NEWTON_EPSILON = 1e-6;
const BISECTION_ITERATIONS = 40;

const curveAxis = (control1: number, control2: number, param: number): number => {
  const inverse = 1 - param;
  return 3 * inverse * inverse * param * control1 + 3 * inverse * param * param * control2 + param * param * param;
};

const curveAxisSlope = (control1: number, control2: number, param: number): number => {
  const inverse = 1 - param;
  return 3 * inverse * inverse * control1 + 6 * inverse * param * (control2 - control1) + 3 * param * param * (1 - control2);
};

const newtonSolve = (x1: number, x2: number, targetX: number): number | null => {
  let param = targetX;
  for (let iteration = 0; iteration < NEWTON_ITERATIONS; iteration += 1) {
    const error = curveAxis(x1, x2, param) - targetX;
    if (Math.abs(error) < NEWTON_EPSILON) return param;
    const slope = curveAxisSlope(x1, x2, param);
    if (Math.abs(slope) < NEWTON_EPSILON) return null;
    param -= error / slope;
  }
  return Math.abs(curveAxis(x1, x2, param) - targetX) < NEWTON_EPSILON ? param : null;
};

const bisectionSolve = (x1: number, x2: number, targetX: number): number => {
  let low = 0;
  let high = 1;
  let param = targetX;
  for (let iteration = 0; iteration < BISECTION_ITERATIONS; iteration += 1) {
    param = (low + high) / 2;
    if (curveAxis(x1, x2, param) < targetX) low = param;
    else high = param;
  }
  return param;
};

const solveCurveParam = (curve: BezierCurve, progress: number): number => {
  const [x1, , x2] = curve;
  const newton = newtonSolve(x1, x2, progress);
  if (newton !== null && newton >= 0 && newton <= 1) return newton;
  return bisectionSolve(x1, x2, progress);
};

export const cubicBezierEase = (curve: BezierCurve, progress: number): number => {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;
  const [, y1, , y2] = curve;
  return curveAxis(y1, y2, solveCurveParam(curve, progress));
};
