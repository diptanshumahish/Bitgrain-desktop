import type { FrameStyleDefinition } from "../../../engine/style-definition";
import type { ParamValues } from "../../../engine/style-types";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { anglePath, MOTION_PATHS, PATH_OPTIONS, resamplePath, type PathPoint } from "./motion-paths";
import { averageShifts, type PixelShift } from "./shift-average";

const PERCENT = 100;
const LENGTH_GAIN = 0.12;
const MIN_LENGTH = 0.5;
const TAPS_PER_PIXEL = 1.5;
const MIN_TAPS = 3;
const MAX_TAPS = 64;

const KEYS = { amount: "amount", path: "path", angle: "angle" } as const;

const pathFor = (params: ParamValues): PathPoint[] => {
  const preset = MOTION_PATHS[textParam(params, KEYS.path)];
  return preset ? preset() : anglePath(numberParam(params, KEYS.angle));
};

const shiftsFor = (points: readonly PathPoint[], length: number): PixelShift[] => {
  const centreX = points.reduce((sum, point) => sum + point[0], 0) / points.length;
  const centreY = points.reduce((sum, point) => sum + point[1], 0) / points.length;
  return points.map(([across, down]) => ({
    shiftX: Math.round((across - centreX) * length),
    shiftY: Math.round((down - centreY) * length),
  }));
};

const motionShifts = (params: ParamValues, width: number, height: number): PixelShift[] => {
  const length = (numberParam(params, KEYS.amount) / PERCENT) * Math.max(width, height) * LENGTH_GAIN;
  if (length < MIN_LENGTH) return [{ shiftX: 0, shiftY: 0 }];
  const taps = Math.min(MAX_TAPS, Math.max(MIN_TAPS, Math.round(length * TAPS_PER_PIXEL)));
  return shiftsFor(resamplePath(pathFor(params), taps), length);
};

export const MOTION_BLUR_STYLE: FrameStyleDefinition = {
  id: "motionblur",
  label: "Motion blur",
  hint: "Smear the picture along a path, like a moving camera",
  glyph: "⇉",
  category: "blur",
  kind: "frame",
  params: [
    { kind: "number", key: KEYS.amount, label: "Distance", min: 0, max: 100, step: 1, default: 35, suffix: "%" },
    { kind: "select", key: KEYS.path, label: "Path", options: PATH_OPTIONS, default: "line" },
    { kind: "number", key: KEYS.angle, label: "Direction", min: 0, max: 360, step: 1, default: 0, suffix: "°", advanced: true, hint: "Used by the straight path" },
    ...frameToneParams(),
  ],
  renderFrame: ({ frame, source, params }) => {
    averageShifts(toneAdjustedSource(source, params), motionShifts(params, source.width, source.height), frame.pixels().data);
    frame.commit();
  },
};
