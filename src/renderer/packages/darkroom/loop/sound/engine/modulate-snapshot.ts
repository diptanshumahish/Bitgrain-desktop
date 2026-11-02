import type { TransformSnapshot } from "@bitgrain/engine/core/transform-snapshot";
import type { TransformMode } from "@bitgrain/engine/core/types";
import { HALFTONE_DEFAULTS } from "@bitgrain/engine/plugins/halftone/halftone-defaults";
import type { SoundDrive } from "../sound-settings";

const HALFTONE_SWELL = 0.9;
const POPART_THRESHOLD_DROP = 0.22;
const DITHER_CONTRAST_PUSH = 0.55;
const LIGHT_BRIGHTNESS_PUSH = 0.22;
const LIGHT_CONTRAST_PUSH = 0.28;
const GRAIN_PUSH = 0.4;
const GRIT_PUSH = 0.4;
const POPART_GRAIN_PUSH = 0.45;
const MAX_UNIT = 1;

const clampUnit = (value: number): number => Math.min(MAX_UNIT, Math.max(0, value));

const hasMode = (snap: TransformSnapshot, mode: TransformMode): boolean => snap.modes.includes(mode);

const swellDots = (snap: TransformSnapshot, level: number): TransformSnapshot => ({
  ...snap,
  halftoneIntensity: (snap.halftoneIntensity ?? HALFTONE_DEFAULTS.intensity) * (1 + HALFTONE_SWELL * level),
  popartThreshold: clampUnit(snap.popartThreshold - POPART_THRESHOLD_DROP * level),
  contrast: hasMode(snap, "dither") ? snap.contrast * (1 + DITHER_CONTRAST_PUSH * level) : snap.contrast,
});

const pushLight = (snap: TransformSnapshot, level: number): TransformSnapshot => ({
  ...snap,
  brightness: snap.brightness * (1 + LIGHT_BRIGHTNESS_PUSH * level),
  contrast: snap.contrast * (1 + LIGHT_CONTRAST_PUSH * level),
});

const kickGrain = (snap: TransformSnapshot, level: number): TransformSnapshot => ({
  ...snap,
  grain: clampUnit(snap.grain + GRAIN_PUSH * level),
  halftoneGrit: clampUnit((snap.halftoneGrit ?? HALFTONE_DEFAULTS.grit) + GRIT_PUSH * level),
  popartGrain: clampUnit(snap.popartGrain + POPART_GRAIN_PUSH * level),
});

const MODULATORS: Record<SoundDrive, (snap: TransformSnapshot, level: number) => TransformSnapshot> = {
  dots: swellDots,
  light: pushLight,
  grain: kickGrain,
};

export const modulateSnapshot = (snap: TransformSnapshot, drive: SoundDrive, level: number): TransformSnapshot =>
  level <= 0 ? snap : MODULATORS[drive](snap, level);
