import type { EllipseFrame } from "./radial-points";

const FULL_TURN_DEG = 360;
const HALF_TURN_DEG = 180;
const DEG_TO_RAD = Math.PI / 180;
const DIGITS = 3;

export interface ArcOptions {
  startDeg: number;
  sweepDeg: number;
  innerRatio: number;
}

const num = (value: number): string => String(Number(value.toFixed(DIGITS)));

const pointAt = (frame: EllipseFrame, ratio: number, degrees: number): string => {
  const radians = degrees * DEG_TO_RAD;
  return `${num(frame.cx + frame.rx * ratio * Math.cos(radians))} ${num(frame.cy + frame.ry * ratio * Math.sin(radians))}`;
};

const fullEllipse = (frame: EllipseFrame, ratio: number): string => {
  const rx = num(frame.rx * ratio);
  const ry = num(frame.ry * ratio);
  return `M ${pointAt(frame, ratio, 0)} A ${rx} ${ry} 0 1 1 ${pointAt(frame, ratio, HALF_TURN_DEG)} A ${rx} ${ry} 0 1 1 ${pointAt(frame, ratio, 0)} Z`;
};

const arcTo = (frame: EllipseFrame, ratio: number, endDeg: number, largeArc: number, sweepFlag: number): string =>
  `A ${num(frame.rx * ratio)} ${num(frame.ry * ratio)} 0 ${largeArc} ${sweepFlag} ${pointAt(frame, ratio, endDeg)}`;

export const isFullDisc = (options: ArcOptions): boolean =>
  options.sweepDeg >= FULL_TURN_DEG && options.innerRatio <= 0;

export const arcPath = (frame: EllipseFrame, options: ArcOptions): string => {
  const sweep = Math.max(0, Math.min(FULL_TURN_DEG, options.sweepDeg));
  const inner = Math.max(0, Math.min(1, options.innerRatio));
  if (sweep >= FULL_TURN_DEG) {
    return inner > 0 ? `${fullEllipse(frame, 1)} ${fullEllipse(frame, inner)}` : fullEllipse(frame, 1);
  }
  const start = options.startDeg;
  const end = start + sweep;
  const largeArc = sweep > HALF_TURN_DEG ? 1 : 0;
  const outer = `M ${pointAt(frame, 1, start)} ${arcTo(frame, 1, end, largeArc, 1)}`;
  if (inner <= 0) return `${outer} L ${num(frame.cx)} ${num(frame.cy)} Z`;
  return `${outer} L ${pointAt(frame, inner, end)} ${arcTo(frame, inner, start, largeArc, 0)} Z`;
};
