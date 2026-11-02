import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import type { ParamSpec } from "../../../../engine/style-types";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { DEGREES_TO_RADIANS, PERCENT } from "../shared/screen-math";
import { opaqueBuffer } from "../shared/pixel-buffers";
import { DITHER_PALETTE_OPTIONS, ORIGINAL_PALETTE_ID, ditherPaletteRgb } from "./dither-palettes";
import { ORDERED_OPTIONS, buildPatternField } from "./dither-patterns";
import { DIFFUSION_OPTIONS, ditherDiffusion, isDiffusionAlgorithm } from "./dither-diffusion";
import { ditherOrdered } from "./dither-ordered";
import { downscaleForDither, paintDitherGrid } from "./dither-grid";
import type { DitherJob } from "./dither-job";

const BIAS_CENTRE = 50;
const BIAS_GAIN = 2.54;

const CHROMA_OPTIONS = [
  { value: "standard", label: "Full colour" },
  { value: "luminance", label: "Brightness only" },
  { value: "perChannel", label: "Per channel" },
];

const DITHER_PARAMS: readonly ParamSpec[] = [
  { kind: "select", key: "algorithm", label: "Pattern", options: [...DIFFUSION_OPTIONS, ...ORDERED_OPTIONS], default: "bayer8" },
  { kind: "select", key: "palette", label: "Palette", options: DITHER_PALETTE_OPTIONS, default: "riso" },
  { kind: "number", key: "pixelSize", label: "Pixel size", min: 1, max: 12, step: 1, default: 2, suffix: "px", scalesWithExport: true },
  { kind: "select", key: "chroma", label: "Colour matching", options: CHROMA_OPTIONS, default: "standard", advanced: true },
  { kind: "number", key: "strength", label: "Strength", min: 0, max: 100, step: 1, default: 100, suffix: "%", advanced: true },
  { kind: "number", key: "contrast", label: "Contrast", min: 0, max: 200, step: 1, default: 110, suffix: "%", advanced: true },
  { kind: "number", key: "lightness", label: "Lightness", min: 0, max: 100, step: 1, default: 50, suffix: "%", advanced: true },
  { kind: "number", key: "patternSize", label: "Pattern size", min: 2, max: 32, step: 1, default: 8, advanced: true, hint: "Sets the line and ring spacing, and stretches the grid patterns" },
  { kind: "number", key: "angle", label: "Angle", min: 0, max: 180, step: 1, default: 0, suffix: "°", advanced: true, hint: "Turns the radial pattern" },
];

const renderDither = ({ frame, source, params }: FrameRenderInput): void => {
  const algorithm = textParam(params, "algorithm");
  const paletteId = textParam(params, "palette");
  const grid = downscaleForDither(source, Math.max(1, numberParam(params, "pixelSize")), numberParam(params, "contrast"));
  const job: DitherJob = {
    ...grid,
    palette: ditherPaletteRgb(paletteId),
    original: paletteId === ORIGINAL_PALETTE_ID,
    chroma: textParam(params, "chroma"),
    strength: numberParam(params, "strength") / PERCENT,
    bias: (numberParam(params, "lightness") - BIAS_CENTRE) * BIAS_GAIN,
    output: opaqueBuffer(grid.width, grid.height),
  };
  if (isDiffusionAlgorithm(algorithm)) ditherDiffusion(job, algorithm);
  else ditherOrdered(job, buildPatternField({ algorithm, cellSize: numberParam(params, "patternSize"), angle: numberParam(params, "angle") * DEGREES_TO_RADIANS }, grid.width, grid.height));
  paintDitherGrid(frame, job.output, grid.width, grid.height);
};

export const DITHER_STYLE: FrameStyleDefinition = {
  id: "dither-style",
  label: "Dither",
  hint: "Retro dither patterns in classic palettes",
  glyph: "▚",
  category: "print",
  kind: "frame",
  params: DITHER_PARAMS,
  renderFrame: renderDither,
};
