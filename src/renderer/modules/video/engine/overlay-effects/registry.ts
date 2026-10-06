import type { OverlayEffect, OverlayEffectKind } from "../../types";
import type { OverlayEffectFn } from "./types";
import { applyGlitch } from "./glitch";
import { applyRgbSplit } from "./rgb-split";
import { applyScanlines } from "./scanlines";
import { applyPixelate } from "./pixelate";
import { applyWave } from "./wave";

export interface OverlayEffectDef {
  label: string;
  glyph: string;
  animated: boolean;
  defaultIntensity: number;
  defaultSpeed: number;
  apply: OverlayEffectFn;
}

export const OVERLAY_EFFECTS: Record<OverlayEffectKind, OverlayEffectDef> = {
  glitch: {
    label: "Glitch",
    glyph: "/=/",
    animated: true,
    defaultIntensity: 0.5,
    defaultSpeed: 0.6,
    apply: applyGlitch,
  },
  "rgb-split": {
    label: "RGB split",
    glyph: "<|>",
    animated: true,
    defaultIntensity: 0.5,
    defaultSpeed: 0.4,
    apply: applyRgbSplit,
  },
  scanlines: {
    label: "Scanlines (CRT)",
    glyph: "===",
    animated: true,
    defaultIntensity: 0.5,
    defaultSpeed: 0.3,
    apply: applyScanlines,
  },
  pixelate: {
    label: "Pixelate",
    glyph: "[#]",
    animated: false,
    defaultIntensity: 0.4,
    defaultSpeed: 0,
    apply: applyPixelate,
  },
  wave: {
    label: "Wave warp",
    glyph: "~~~",
    animated: true,
    defaultIntensity: 0.5,
    defaultSpeed: 0.5,
    apply: applyWave,
  },
};

export const OVERLAY_EFFECT_KINDS = Object.keys(
  OVERLAY_EFFECTS,
) as OverlayEffectKind[];

export function defaultOverlayEffect(kind: OverlayEffectKind): OverlayEffect {
  const def = OVERLAY_EFFECTS[kind];
  return { kind, intensity: def.defaultIntensity, speed: def.defaultSpeed };
}
