import type { EffectParams } from "../../types";
import type { ContextSeeds } from "../build-transform-context";

const FRAME_SEED_HZ = 30;
const DEFAULT_POPART_JITTER_HZ = 30;
const DEFAULT_HALFTONE_JITTER_HZ = 0;
const AUTO_JITTER_MIN_HZ = 4;
const AUTO_JITTER_MAX_HZ = 60;

function effectiveHz(
  manualHz: number | undefined,
  auto: boolean | undefined,
  motion: number,
  fallback: number,
): number {
  if (auto) return AUTO_JITTER_MIN_HZ + (AUTO_JITTER_MAX_HZ - AUTO_JITTER_MIN_HZ) * motion;
  return manualHz ?? fallback;
}

export function computeFrameSeeds(
  params: Partial<EffectParams>,
  time: number,
  motion: number,
): ContextSeeds {
  const popartHz = effectiveHz(params.popartJitterHz, params.popartJitterAuto, motion, DEFAULT_POPART_JITTER_HZ);
  const halftoneHz = effectiveHz(params.halftoneJitterHz, params.halftoneJitterAuto, motion, DEFAULT_HALFTONE_JITTER_HZ);
  return {
    frameSeed: Math.floor(time * FRAME_SEED_HZ),
    popartFrameSeed: Math.floor(time * popartHz),
    halftoneFrameSeed: Math.floor(time * halftoneHz),
  };
}
