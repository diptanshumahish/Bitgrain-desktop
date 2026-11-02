import type { BitgrainEffect } from "../../../data/studioTypes";
import { applyBitgrainEffectAsync } from "../../../utils/bitgrain-effect";
import { isPixelGridEffect } from "../../../components/studio/hooks/export/effects/effect-export-plan";
import { createCanvas } from "../../../engine/selective/brush-canvas";
import { alphaToCanvas } from "../mask/canvas/alpha-canvas";
import { composeMaskedEffect } from "../mask/canvas/compose-masked-effect";
import { drawFitted } from "./grade-canvas";
import { needsPixelPass, type PhotoLook } from "./photo-look";
import { runPixelPass } from "./local-mask-pass";

type PhotoSource = HTMLImageElement | HTMLCanvasElement;

export interface LookLimits {
  gradeMax: number;
  effectMax: number;
}

const composeEffectAlpha = (
  base: HTMLCanvasElement,
  effected: HTMLCanvasElement,
  effectAlpha: Float32Array,
  effect: BitgrainEffect,
): HTMLCanvasElement => {
  const target = createCanvas(base.width, base.height);
  const maskCanvas = alphaToCanvas(effectAlpha, base.width, base.height);
  composeMaskedEffect({ target, effect: effected, base, maskCanvas, effectSmoothing: !isPixelGridEffect(effect) });
  return target;
};

export const renderPhotoLook = async (source: PhotoSource, look: PhotoLook, limits: LookLimits): Promise<PhotoSource> => {
  if (!needsPixelPass(look)) {
    return look.effect ? applyBitgrainEffectAsync(source, look.effect, { maxDimension: limits.effectMax }) : source;
  }
  const base = drawFitted(source, limits.gradeMax);
  const effectAlpha = await runPixelPass(base, look.grade, look.masks);
  if (!look.effect) return base;
  const effected = await applyBitgrainEffectAsync(base, look.effect, { maxDimension: limits.effectMax });
  return effectAlpha ? composeEffectAlpha(base, effected, effectAlpha, look.effect) : effected;
};
