import type {
  ImagePlugin,
  TransformContext,
  TransformationResult,
} from "../core/types";
import { HALFTONE_DEFAULTS } from "./halftone/halftone-defaults";
import { resolveHalftoneCell } from "./halftone/halftone-cell";
import { edgeWidthFor } from "./halftone/halftone-coverage";
import { prefilterForScreen } from "./halftone/halftone-prefilter";
import { normalizeScreenTone } from "./halftone/halftone-tone";
import { halftoneOutputScale } from "./halftone/output-scale";
import { buildCmykGrids, renderCmykRows } from "./halftone/cmyk-screen";
import { buildSingleGrid, renderSingleRows } from "./halftone/single-screen";
import type { RowRange, ScreenJob, ScreenPlan } from "./halftone/screen-types";
import { jitterTone } from "../utils/boil-jitter";

const WOBBLE_RATE = 0.37;
const WOBBLE_DEGREES = 0.15;
const SHARPNESS_MAX = 100;
const RGBA_STRIDE = 4;
const CMYK_PLATES = 4;
const BOIL_TONE_AMPLITUDE = 22;

const angleWobbleFor = (frameSeed: number): number =>
  frameSeed === 0 ? 0 : Math.sin(frameSeed * WOBBLE_RATE) * WOBBLE_DEGREES;

const screenSource = (ctx: TransformContext, cellPx: number): Float32Array => {
  const source = normalizeScreenTone(prefilterForScreen(ctx.data, ctx.width, ctx.height, cellPx), ctx.width, ctx.height);
  return ctx.boilSeed === undefined ? source : jitterTone(source, ctx.boilSeed, BOIL_TONE_AMPLITUDE);
};

const buildJob = (ctx: TransformContext): ScreenJob => {
  const cellPx = resolveHalftoneCell(ctx);
  const style = ctx.halftoneStyle ?? HALFTONE_DEFAULTS.style;
  const plateCount = style === "cmyk" ? CMYK_PLATES : 1;
  const outScale = halftoneOutputScale(ctx.width, ctx.height, cellPx, plateCount, ctx.halftoneSupersample === true);
  const sharpness = Math.min(SHARPNESS_MAX, Math.max(0, ctx.halftoneSharpness ?? HALFTONE_DEFAULTS.sharpness));
  return {
    source: screenSource(ctx, cellPx),
    width: ctx.width,
    height: ctx.height,
    outScale,
    cellPx,
    edgeWidth: edgeWidthFor(sharpness, cellPx, 1 / outScale),
    angleWobble: angleWobbleFor((ctx.halftoneFrameSeed ?? 0) | 0),
    baseAngle: ctx.halftoneAngle ?? HALFTONE_DEFAULTS.angle,
    style,
    shape: ctx.halftoneShape ?? HALFTONE_DEFAULTS.shape,
    intensity: ctx.halftoneIntensity ?? HALFTONE_DEFAULTS.intensity,
    grit: ctx.halftoneGrit ?? HALFTONE_DEFAULTS.grit,
    invert: ctx.halftoneInvert ?? HALFTONE_DEFAULTS.invert,
    paper: ctx.paperColor,
  };
};

export const planHalftone = (ctx: TransformContext): ScreenPlan => {
  const job = buildJob(ctx);
  return {
    style: job.style,
    width: job.width,
    height: job.height,
    outScale: job.outScale,
    outWidth: Math.round(job.width * job.outScale),
    outHeight: Math.round(job.height * job.outScale),
    cellPx: job.cellPx,
    edgeWidth: job.edgeWidth,
    shape: job.shape,
    grit: job.grit,
    invert: job.invert,
    paper: job.paper,
    grids: job.style === "cmyk" ? buildCmykGrids(job) : [buildSingleGrid(job)],
  };
};

export const renderScreenRows = (plan: ScreenPlan, rows: RowRange): Uint8ClampedArray => {
  const out = new Uint8ClampedArray((rows.end - rows.start) * plan.outWidth * RGBA_STRIDE);
  if (plan.style === "cmyk") renderCmykRows(plan, rows, out);
  else renderSingleRows(plan, rows, out);
  return out;
};

export const halftoneResult = (plan: ScreenPlan, colorData: Uint8ClampedArray): TransformationResult => ({
  colorData,
  gridWidth: plan.outWidth,
  gridHeight: plan.outHeight,
});

export const HalftonePlugin: ImagePlugin = {
  id: "halftone",
  name: "Halftone",
  category: "Textures",

  transform: (ctx: TransformContext): TransformationResult => {
    const plan = planHalftone(ctx);
    const colorData = renderScreenRows(plan, { start: 0, end: plan.outHeight });
    return { ...halftoneResult(plan, colorData), workingData: new Float32Array(colorData) };
  },
};
