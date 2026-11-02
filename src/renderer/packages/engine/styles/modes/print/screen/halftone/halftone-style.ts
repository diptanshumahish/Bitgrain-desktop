import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import type { ParamSpec, ParamValues } from "../../../../engine/style-types";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { hexToRgbTriple } from "../../../../postfx/pixel-ops";
import { cellSizeParam } from "../../../shared-params";
import { CHANNEL_MAX, DEGREES_TO_RADIANS, PERCENT } from "../shared/screen-math";
import { buildHalftoneCells, type CellTone, type ScreenFrame } from "./halftone-cells";
import { renderHalftone } from "./halftone-render";
import { DOT_SHAPE_OPTIONS, dotShapeFor } from "./halftone-shape-table";
import { DOTS_TEXTURE, TEXTURE_OPTIONS, screenThresholdFor } from "./halftone-screens";

const MIN_CELL = 4;
const CELL_GAIN = 1.5;
const GAMMA_BASE = 0.55;
const GAMMA_RANGE = 1.65;
const DENSITY = 100 / 85;
const SPREAD_GAIN = 0.6;
const TONE_CONTRAST = 20;

const COLOUR_OPTIONS = [
  { value: "mono", label: "Ink on paper" },
  { value: "color", label: "Photo colours" },
];

const HALFTONE_PARAMS: readonly ParamSpec[] = [
  cellSizeParam("Dot size", 7),
  { kind: "select", key: "shape", label: "Shape", options: DOT_SHAPE_OPTIONS, default: "circle" },
  { kind: "select", key: "colour", label: "Colour", options: COLOUR_OPTIONS, default: "color" },
  { kind: "select", key: "texture", label: "Screen", options: TEXTURE_OPTIONS, default: DOTS_TEXTURE, advanced: true, hint: "Swap dots for a line or pattern screen" },
  { kind: "number", key: "angle", label: "Angle", min: 0, max: 90, step: 1, default: 15, suffix: "°", advanced: true },
  { kind: "number", key: "depth", label: "Depth", min: 0, max: 100, step: 1, default: 50, suffix: "%", advanced: true, hint: "Higher keeps the mid tones lighter" },
  { kind: "number", key: "dotGain", label: "Dot gain", min: 0, max: 100, step: 1, default: 0, suffix: "%", advanced: true },
  { kind: "number", key: "sharpness", label: "Sharpness", min: 0, max: 100, step: 1, default: 70, suffix: "%", advanced: true },
  { kind: "colour", key: "ink", label: "Ink", default: "#141414", advanced: true },
  { kind: "colour", key: "paper", label: "Paper", default: "#f4f1e8", advanced: true },
  ...frameToneParams(TONE_CONTRAST),
];

const unitRgb = (hex: string): number[] => hexToRgbTriple(hex).map((value) => value / CHANNEL_MAX);

const screenFor = (input: FrameRenderInput): ScreenFrame => {
  const angle = numberParam(input.params, "angle") * DEGREES_TO_RADIANS;
  return {
    cell: Math.max(MIN_CELL * input.scale, CELL_GAIN * numberParam(input.params, "size")),
    cosine: Math.cos(angle),
    sine: Math.sin(angle),
    centreX: input.source.width / 2,
    centreY: input.source.height / 2,
  };
};

const toneFor = (params: ParamValues): CellTone => ({
  gamma: GAMMA_BASE + (GAMMA_RANGE * numberParam(params, "depth")) / PERCENT,
  density: DENSITY,
  spread: (SPREAD_GAIN * numberParam(params, "dotGain")) / PERCENT,
  colourInk: textParam(params, "colour") === "color",
  inkRgb: unitRgb(textParam(params, "ink")),
});

const renderHalftoneFrame = (input: FrameRenderInput): void => {
  const { params, frame } = input;
  const source = toneAdjustedSource(input.source, params);
  const screen = screenFor(input);
  const texture = textParam(params, "texture");
  const shape = dotShapeFor(textParam(params, "shape"));
  const cells = buildHalftoneCells(source, screen, toneFor(params));
  const output = new Uint8ClampedArray(source.data.length);
  renderHalftone({
    source, screen, cells,
    distance: texture === DOTS_TEXTURE ? shape.distance : null,
    areaGain: shape.areaGain,
    threshold: screenThresholdFor(texture),
    sharpness: numberParam(params, "sharpness") / PERCENT,
    paperRgb: unitRgb(textParam(params, "paper")),
    colourPaper: textParam(params, "colour") === "color",
  }, output);
  frame.writePixels(output);
};

export const HALFTONE_STYLE: FrameStyleDefinition = {
  id: "halftone-style",
  label: "Halftone",
  hint: "Printed dots that swell in the shadows",
  glyph: "◉",
  category: "print",
  kind: "frame",
  params: HALFTONE_PARAMS,
  renderFrame: renderHalftoneFrame,
};
