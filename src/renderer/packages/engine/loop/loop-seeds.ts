import { DEFAULT_EFFECT_SEED } from "../utils/seeded-random";

export type LoopMotion = "grain" | "boil" | "grain-boil";

interface LoopSeedParams {
  frameSeed?: number;
  boilSeed?: number;
  halftoneFrameSeed?: number;
  popartFrameSeed?: number;
}

const FIRST_BOIL_SEED = 1;
const STILL_SCREEN_SEED = 0;

const movesGrain = (motion: LoopMotion): boolean => motion === "grain" || motion === "grain-boil";

const movesBoil = (motion: LoopMotion): boolean => motion === "boil" || motion === "grain-boil";

export const grainSeedFor = (motion: LoopMotion, frameIndex: number): number =>
  movesGrain(motion) ? DEFAULT_EFFECT_SEED + frameIndex : DEFAULT_EFFECT_SEED;

export const seedParamsFor = (motion: LoopMotion, frameIndex: number): LoopSeedParams => {
  const frameSeed = grainSeedFor(motion, frameIndex);
  if (!movesBoil(motion)) {
    return { frameSeed, halftoneFrameSeed: STILL_SCREEN_SEED, popartFrameSeed: STILL_SCREEN_SEED };
  }
  const boilSeed = FIRST_BOIL_SEED + frameIndex;
  return { frameSeed, boilSeed, halftoneFrameSeed: boilSeed, popartFrameSeed: boilSeed };
};
