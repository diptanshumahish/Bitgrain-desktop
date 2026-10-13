import type {
  ImagePlugin,
  TransformContext,
  TransformationResult,
} from "../types";
import { HALFTONE_DEFAULTS } from "./halftone/halftone-defaults";
import { resolveHalftoneCell } from "./halftone/halftone-cell";
import { edgeWidthFor } from "./halftone/halftone-coverage";
import { prefilterForScreen } from "./halftone/halftone-prefilter";
import { normalizeScreenTone } from "./halftone/halftone-tone";
import { halftoneOutputScale } from "./halftone/output-scale";
import { renderCmykScreen } from "./halftone/cmyk-screen";
import { renderSingleScreen } from "./halftone/single-screen";
import type { ScreenJob } from "./halftone/screen-types";

const WOBBLE_RATE = 0.37;
const WOBBLE_DEGREES = 0.15;
const SHARPNESS_MAX = 100;
const RGBA_STRIDE = 4;
const CMYK_PLATES = 4;

const angleWobbleFor = (frameSeed: number): number =>
  frameSeed === 0 ? 0 : Math.sin(frameSeed * WOBBLE_RATE) * WOBBLE_DEGREES;

const buildJob = (ctx: TransformContext): ScreenJob => {
  const cellPx = resolveHalftoneCell(ctx);
  const style = ctx.halftoneStyle ?? HALFTONE_DEFAULTS.style;
  const plateCount = style === "cmyk" ? CMYK_PLATES : 1;
  const outScale = halftoneOutputScale(ctx.width, ctx.height, cellPx, plateCount, ctx.halftoneSupersample === true);
  const sharpness = Math.min(SHARPNESS_MAX, Math.max(0, ctx.halftoneSharpness ?? HALFTONE_DEFAULTS.sharpness));
  const outWidth = Math.round(ctx.width * outScale);
  const outHeight = Math.round(ctx.height * outScale);
  return {
    source: normalizeScreenTone(prefilterForScreen(ctx.data, ctx.width, ctx.height, cellPx), ctx.width, ctx.height),
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
    out: new Uint8ClampedArray(outWidth * outHeight * RGBA_STRIDE),
  };
};

export const HalftonePlugin: ImagePlugin = {
  id: "halftone",
  name: "Halftone",
  category: "Textures",

  transform: (ctx: TransformContext): TransformationResult => {
    const job = buildJob(ctx);
    if (job.style === "cmyk") renderCmykScreen(job);
    else renderSingleScreen(job);
    const gridWidth = Math.round(ctx.width * job.outScale);
    const gridHeight = Math.round(ctx.height * job.outScale);
    return { colorData: job.out, workingData: Float32Array.from(job.out), gridWidth, gridHeight };
  },
};
