import { latticeHash } from "../shared/lattice-hash";
import { fract, TAU } from "../shared/light-maths";
import { fieldAt, type DustField } from "./dust-field";

const PROFILE_ENTRIES = 256;
const SPRITE_STOPS: readonly [number, number][] = [[0, 1], [0.18, 0.72], [0.45, 0.26], [0.75, 0.06], [1, 0]];
const STEP_X = 0.75488;
const STEP_Y = 0.56984;
const JITTER = 0.3;
const RANK_POWER = 1.35;
const RANK_BASE = 0.35;
const RANK_GAIN = 1.2;
const PUSH_GAIN = 3.2;
const SWIRL_GAIN = 0.6;
const RADIUS_BASE = 0.42;
const RADIUS_GAIN = 0.75;
const MIN_SIZE = 0.25;
const SIZE_VARIANCE = 1.4;
const ALPHA_BASE = 0.06;
const ALPHA_GAIN = 0.34;
const ALPHA_VARIANCE = 0.5;
const MIN_ALPHA = 0.01;
const SALT_JITTER_X = 1;
const SALT_JITTER_Y = 2;
const SALT_ANGLE = 3;
const SALT_VARIANCE = 4;

export interface SplatSettings {
  spacing: number;
  count: number;
  threshold: number;
  density: number;
  push: number;
  swirl: number;
  baseRadius: number;
  sparkle: number;
  gradientStep: number;
}

export interface SplatPlane {
  values: Float32Array;
  width: number;
  height: number;
}

const profileAt = (distance: number): number => {
  for (let stop = 1; stop < SPRITE_STOPS.length; stop++) {
    const [offset, alpha] = SPRITE_STOPS[stop];
    if (distance > offset) continue;
    const [previousOffset, previousAlpha] = SPRITE_STOPS[stop - 1];
    return previousAlpha + ((alpha - previousAlpha) * (distance - previousOffset)) / (offset - previousOffset);
  }
  return 0;
};

const buildProfile = (): Float32Array => {
  const profile = new Float32Array(PROFILE_ENTRIES + 1);
  for (let entry = 0; entry <= PROFILE_ENTRIES; entry++) profile[entry] = profileAt(Math.sqrt(entry / PROFILE_ENTRIES));
  return profile;
};

const stampSplat = (plane: SplatPlane, profile: Float32Array, centreX: number, centreY: number, radius: number, alpha: number): void => {
  const left = Math.max(0, Math.floor(centreX - radius));
  const right = Math.min(plane.width - 1, Math.ceil(centreX + radius));
  const top = Math.max(0, Math.floor(centreY - radius));
  const bottom = Math.min(plane.height - 1, Math.ceil(centreY + radius));
  const inverse = PROFILE_ENTRIES / (radius * radius);
  for (let y = top; y <= bottom; y++) {
    const offsetY = (y + 0.5 - centreY) ** 2;
    for (let x = left; x <= right; x++) {
      const entry = ((x + 0.5 - centreX) ** 2 + offsetY) * inverse;
      if (entry < PROFILE_ENTRIES) plane.values[y * plane.width + x] += alpha * profile[Math.floor(entry)];
    }
  }
};

const passesGate = (settings: SplatSettings, index: number, level: number): boolean => {
  if (level <= settings.threshold) return false;
  const share = ((level - settings.threshold) / (1 - settings.threshold)) ** RANK_POWER * (RANK_BASE + RANK_GAIN * settings.density);
  return (index + 0.5) / settings.count < share;
};

const wrap = (value: number, size: number): number => ((value % size) + size) % size;

const drawSplat = (plane: SplatPlane, profile: Float32Array, field: DustField, settings: SplatSettings, index: number): void => {
  const spacing = settings.spacing;
  const siteX = wrap(fract(0.5 + index * STEP_X) * field.width + (latticeHash(index, 0, SALT_JITTER_X) * 2 - 1) * JITTER * spacing, field.width);
  const siteY = wrap(fract(0.5 + index * STEP_Y) * field.height + (latticeHash(index, 0, SALT_JITTER_Y) * 2 - 1) * JITTER * spacing, field.height);
  const level = fieldAt(field, siteX, siteY);
  if (!passesGate(settings, index, level)) return;
  const angleHash = latticeHash(index, 0, SALT_ANGLE);
  const varianceHash = latticeHash(index, 0, SALT_VARIANCE);
  const step = settings.gradientStep;
  const slopeX = fieldAt(field, siteX + step, siteY) - fieldAt(field, siteX - step, siteY);
  const slopeY = fieldAt(field, siteX, siteY + step) - fieldAt(field, siteX, siteY - step);
  const drift = SWIRL_GAIN * settings.swirl * settings.push * (2 * varianceHash - 1);
  const x = siteX - slopeX * settings.push * PUSH_GAIN + Math.cos(TAU * angleHash) * drift;
  const y = siteY - slopeY * settings.push * PUSH_GAIN + Math.sin(TAU * angleHash) * drift;
  const radius = settings.baseRadius * (RADIUS_BASE + RADIUS_GAIN * level) * Math.max(MIN_SIZE, 1 + SIZE_VARIANCE * settings.sparkle * (varianceHash - 0.5));
  const alpha = Math.min(1, (ALPHA_BASE + ALPHA_GAIN * level) * (1 - ALPHA_VARIANCE * settings.sparkle * angleHash));
  if (alpha < MIN_ALPHA) return;
  stampSplat(plane, profile, x, y, radius, alpha);
};

export const splatDust = (field: DustField, settings: SplatSettings): SplatPlane => {
  const plane: SplatPlane = { values: new Float32Array(field.width * field.height), width: field.width, height: field.height };
  const profile = buildProfile();
  for (let index = 0; index < settings.count; index++) drawSplat(plane, profile, field, settings, index);
  return plane;
};
