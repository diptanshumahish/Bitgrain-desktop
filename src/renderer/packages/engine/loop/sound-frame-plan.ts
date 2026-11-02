import type { SoundEnvelopes } from "../audio/analysis/analyse-sound";
import { createSeededRandom } from "../utils/seeded-random";

export type SoundReact = "bass" | "beat" | "track";

export interface SoundRenderKey {
  key: string;
  level: number;
  seedIndex: number;
}

export interface SoundFrame {
  key: string;
  scale: number;
  shiftX: number;
  shiftY: number;
}

export interface SoundFramePlan {
  frames: SoundFrame[];
  keys: SoundRenderKey[];
}

interface SoundPlanRequest {
  envelopes: SoundEnvelopes;
  react: SoundReact;
  strength: number;
  fps: number;
}

const LEVEL_STEPS = 6;
const SEED_CYCLE = 6;
const BOIL_FPS = 12;
const ONSET_SEED_JUMP = 3;
const MAX_SCALE_BUMP = 0.035;
const MAX_SHIFT = 0.006;
const FULL_TURN = 2 * Math.PI;

const driverFor = (envelopes: SoundEnvelopes, react: SoundReact): Float32Array => {
  if (react === "beat") return envelopes.beat;
  if (react === "track") return envelopes.energy;
  return envelopes.bass;
};

const motionFor = (envelopes: SoundEnvelopes, index: number, strength: number): Omit<SoundFrame, "key"> => {
  const amplitude = MAX_SHIFT * envelopes.high[index] * strength;
  const angle = createSeededRandom(index + 1)() * FULL_TURN;
  return {
    scale: 1 + MAX_SCALE_BUMP * envelopes.beat[index] * strength,
    shiftX: Math.cos(angle) * amplitude,
    shiftY: Math.sin(angle) * amplitude,
  };
};

const levelIndexFor = (value: number, strength: number): number =>
  Math.round(Math.min(1, Math.max(0, value * strength)) * (LEVEL_STEPS - 1));

export const buildSoundFramePlan = (request: SoundPlanRequest): SoundFramePlan => {
  const { envelopes, strength, fps } = request;
  const driver = driverFor(envelopes, request.react);
  const boilStep = Math.max(1, Math.round(fps / BOIL_FPS));
  const keys = new Map<string, SoundRenderKey>();
  const frames: SoundFrame[] = [];
  let onsetCount = 0;
  for (let index = 0; index < driver.length; index++) {
    onsetCount += envelopes.onsets[index];
    const levelIndex = levelIndexFor(driver[index], strength);
    const seedIndex = (Math.floor(index / boilStep) + ONSET_SEED_JUMP * onsetCount) % SEED_CYCLE;
    const key = `${levelIndex}:${seedIndex}`;
    if (!keys.has(key)) keys.set(key, { key, level: levelIndex / (LEVEL_STEPS - 1), seedIndex });
    frames.push({ key, ...motionFor(envelopes, index, strength) });
  }
  return { frames, keys: [...keys.values()] };
};
