import type { ExportTiming, SegmentEase } from "./property-timing";
import { curveOvershoots } from "../tracks/easing";

interface SvgKeyframes {
  timesMs: number[];
  splines: string[];
}

export interface SvgAnimateSpec {
  element: "animate" | "animateTransform";
  attributes: string;
  values: string[];
  keyframes: SvgKeyframes;
  totalMs: number;
  loop: boolean;
}

const HOLD_GAP_MS = 0.5;
const OVERSHOOT_STEPS = 12;
const LINEAR_SPLINE = "0 0 1 1";
const KEY_TIME_DIGITS = 5;
const MS_PER_SECOND = 1000;

const pushSegment = (out: SvgKeyframes, fromMs: number, toMs: number, ease: SegmentEase): void => {
  if (ease.kind === "hold") {
    const gapMs = Math.min(HOLD_GAP_MS, (toMs - fromMs) / 2);
    out.timesMs.push(toMs - gapMs, toMs);
    out.splines.push(LINEAR_SPLINE, LINEAR_SPLINE);
    return;
  }
  if (curveOvershoots(ease.curve)) {
    for (let step = 1; step <= OVERSHOOT_STEPS; step += 1) {
      out.timesMs.push(fromMs + ((toMs - fromMs) * step) / OVERSHOOT_STEPS);
      out.splines.push(LINEAR_SPLINE);
    }
    return;
  }
  out.timesMs.push(toMs);
  out.splines.push(ease.curve.join(" "));
};

export const expandForSvg = (timing: ExportTiming): SvgKeyframes => {
  const out: SvgKeyframes = { timesMs: [timing.timesMs[0]], splines: [] };
  for (let index = 0; index < timing.eases.length; index += 1) {
    pushSegment(out, timing.timesMs[index], timing.timesMs[index + 1], timing.eases[index]);
  }
  return out;
};

export const svgAnimateElement = (spec: SvgAnimateSpec): string => {
  const { keyframes, totalMs } = spec;
  if (keyframes.timesMs.length < 2 || totalMs <= 0) return "";
  const keyTimes = keyframes.timesMs.map((timeMs) => (timeMs / totalMs).toFixed(KEY_TIME_DIGITS)).join(";");
  const dur = `${(totalMs / MS_PER_SECOND).toFixed(3)}s`;
  const repeat = spec.loop ? "indefinite" : "1";
  return `<${spec.element} ${spec.attributes} values="${spec.values.join(";")}" keyTimes="${keyTimes}" calcMode="spline" keySplines="${keyframes.splines.join(";")}" dur="${dur}" repeatCount="${repeat}" fill="freeze"/>`;
};
