import type { TextLayer } from "../../../model/studio-types";
import { setCanvasLetterSpacing } from "../../../text/rich-text/letter-spacing";

export interface CanvasRunFeatures {
  smallCaps: boolean;
  stretch: CanvasFontStretch;
  noLigatures: boolean;
}

const LIGATURE_BREAK_SPACING_PX = 0.001;
const NORMAL_STRETCH_PERCENT = 100;

const STRETCH_KEYWORDS: ReadonlyArray<readonly [number, CanvasFontStretch]> = [
  [50, "ultra-condensed"],
  [62.5, "extra-condensed"],
  [75, "condensed"],
  [87.5, "semi-condensed"],
  [100, "normal"],
  [112.5, "semi-expanded"],
  [125, "expanded"],
  [150, "extra-expanded"],
  [200, "ultra-expanded"],
];

export const STRETCH_STEPS: readonly number[] = STRETCH_KEYWORDS.map(([percent]) => percent);

const stretchKeyword = (percent: number | undefined): CanvasFontStretch => {
  const target = percent ?? NORMAL_STRETCH_PERCENT;
  const nearest = STRETCH_KEYWORDS.reduce((best, entry) =>
    Math.abs(entry[0] - target) < Math.abs(best[0] - target) ? entry : best,
  );
  return nearest[1];
};

export const canvasFeaturesFor = (layer: TextLayer): CanvasRunFeatures => ({
  smallCaps: Boolean(layer.fontFeatures?.smallCaps),
  stretch: stretchKeyword(layer.fontVariations?.wdth),
  noLigatures: layer.fontFeatures?.ligatures === false,
});

export const applyCanvasFeatures = (
  ctx: CanvasRenderingContext2D,
  features: CanvasRunFeatures | undefined,
  letterSpacingPx: number,
): void => {
  if (!features) return;
  if ("fontKerning" in ctx) ctx.fontKerning = "normal";
  if ("fontVariantCaps" in ctx) ctx.fontVariantCaps = features.smallCaps ? "small-caps" : "normal";
  if ("fontStretch" in ctx) ctx.fontStretch = features.stretch;
  if (features.noLigatures && letterSpacingPx === 0) setCanvasLetterSpacing(ctx, LIGATURE_BREAK_SPACING_PX);
};

const OBLIQUE_PROBE_FONT = "oblique 10deg 10px serif";
let obliqueSupport: boolean | null = null;

export const canvasSupportsOblique = (ctx: CanvasRenderingContext2D): boolean => {
  if (obliqueSupport !== null) return obliqueSupport;
  const previous = ctx.font;
  ctx.font = OBLIQUE_PROBE_FONT;
  obliqueSupport = ctx.font.includes("oblique");
  ctx.font = previous;
  return obliqueSupport;
};
