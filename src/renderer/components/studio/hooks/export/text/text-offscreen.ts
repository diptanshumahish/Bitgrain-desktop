import type { TextLayer } from "../../../../../data/studioTypes";
import type { TextShadowSpec } from "../../../text-effects/text-shadow-specs";
import type { PositionedRun } from "./text-layout";
import { drawRunDecorations } from "./draw-decorations";
import { setCanvasLetterSpacing } from "../../../rich-text/letter-spacing";

export interface OffscreenBounds {
  originX: number;
  originY: number;
  width: number;
  height: number;
}

const GLYPH_OVERHANG_FONT_RATIO = 1;
const BLUR_REACH_MULTIPLIER = 2;

const shadowReach = (specs: TextShadowSpec[]): number =>
  specs.reduce(
    (reach, spec) => Math.max(reach, Math.abs(spec.x) + Math.abs(spec.y) + spec.blur * BLUR_REACH_MULTIPLIER),
    0,
  );

export const measureOffscreenBounds = (
  layer: TextLayer,
  s: number,
  runs: PositionedRun[],
  specs: TextShadowSpec[],
): OffscreenBounds => {
  const lineHeight = layer.fontSize * s * layer.lineHeight;
  const pad = shadowReach(specs) + layer.fontSize * s * GLYPH_OVERHANG_FONT_RATIO;
  const left = Math.min(layer.x * s, ...runs.map((run) => run.x));
  const right = Math.max((layer.x + layer.width) * s, ...runs.map((run) => run.x + run.width));
  const top = layer.y * s;
  const bottom = Math.max((layer.y + layer.height) * s, ...runs.map((run) => run.y + lineHeight));
  const originX = Math.floor(left - pad);
  const originY = Math.floor(top - pad);
  return {
    originX,
    originY,
    width: Math.max(1, Math.ceil(right + pad - originX)),
    height: Math.max(1, Math.ceil(bottom + pad - originY)),
  };
};

export const prepareTextContext = (ctx: CanvasRenderingContext2D, layer: TextLayer, s: number): void => {
  ctx.textBaseline = "top";
  ctx.textAlign = "left";
  setCanvasLetterSpacing(ctx, layer.letterSpacing * s);
};

const SHADOW_ONLY_FILL = "#000000";

export const drawShadowPasses = (
  ctx: CanvasRenderingContext2D,
  runs: PositionedRun[],
  specs: TextShadowSpec[],
  shift: number,
): void => {
  ctx.fillStyle = SHADOW_ONLY_FILL;
  for (const spec of [...specs].reverse()) {
    ctx.shadowColor = spec.color;
    ctx.shadowBlur = spec.blur;
    ctx.shadowOffsetX = spec.x + shift;
    ctx.shadowOffsetY = spec.y;
    for (const run of runs) {
      ctx.font = run.font;
      setCanvasLetterSpacing(ctx, run.letterSpacing);
      ctx.fillText(run.text, run.x - shift, run.y);
      drawRunDecorations(ctx, run, -shift);
    }
  }
  ctx.shadowColor = "transparent";
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
};

export const drawFillPass = (
  ctx: CanvasRenderingContext2D,
  runs: PositionedRun[],
  fill: string | CanvasGradient,
): void => {
  for (const run of runs) {
    ctx.font = run.font;
    ctx.fillStyle = run.color ?? fill;
    setCanvasLetterSpacing(ctx, run.letterSpacing);
    ctx.fillText(run.text, run.x, run.y);
    drawRunDecorations(ctx, run);
  }
};
