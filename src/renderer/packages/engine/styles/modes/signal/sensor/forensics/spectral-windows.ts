import { hashUnit } from "../../shared/signal-hash";
import { HALF_UNIT, smoothRange } from "../../shared/signal-math";

const FRAME_MARGIN = 0.05;
const FILL_BASE = 0.34;
const FILL_RANGE = 0.54;
const ASPECT_BASE = 0.82;
const ASPECT_RANGE = 0.3;
const SLOT_CAP = 0.92;
const TINT_KINDS = 3;
const SOFT_MIN_PX = 1.5;
const SOFT_SHARE = 0.05;
const RAW_TINT_SHARE = 0.5;
const SCORE_TAPS = 7;
const PLACEMENT_TRIALS = 8;
const TRIAL_SALT = 10;

export interface SpectralWindow {
  centreX: number;
  centreY: number;
  halfWidth: number;
  halfHeight: number;
  tint: number;
  soft: number;
}

interface WindowLayout {
  count: number;
  size: number;
  softness: number;
  seed: number;
  width: number;
  height: number;
  plate: Float32Array;
}

interface WindowSlot {
  centreX: number;
  centreY: number;
  roomX: number;
  roomY: number;
}

const tintFor = (hash: number): number => (hash < RAW_TINT_SHARE ? 0 : 1 + Math.floor(((hash - RAW_TINT_SHARE) / (1 - RAW_TINT_SHARE)) * (TINT_KINDS - 1)));

const sizeWindow = (layout: WindowLayout, index: number, slotWidth: number, slotHeight: number): SpectralWindow => {
  const fill = FILL_BASE + FILL_RANGE * layout.size;
  const halfWidth = Math.min(HALF_UNIT * slotWidth * SLOT_CAP, HALF_UNIT * slotWidth * fill * (ASPECT_BASE + ASPECT_RANGE * hashUnit(index, 2, layout.seed)));
  const halfHeight = Math.min(HALF_UNIT * slotHeight * SLOT_CAP, HALF_UNIT * slotHeight * fill * (ASPECT_BASE + ASPECT_RANGE * hashUnit(index, 3, layout.seed)));
  return {
    centreX: 0, centreY: 0, halfWidth, halfHeight,
    tint: tintFor(hashUnit(index, 5, layout.seed)),
    soft: Math.max(SOFT_MIN_PX, layout.softness * Math.min(layout.width, layout.height) * SOFT_SHARE),
  };
};

const tapSpread = (tap: number): number => (tap / (SCORE_TAPS - 1) - HALF_UNIT) / HALF_UNIT;

const detailInside = (layout: WindowLayout, window: SpectralWindow, centreX: number, centreY: number): number => {
  let sum = 0;
  let squares = 0;
  for (let step = 0; step < SCORE_TAPS * SCORE_TAPS; step++) {
    const x = Math.round(centreX + window.halfWidth * tapSpread(step % SCORE_TAPS));
    const y = Math.round(centreY + window.halfHeight * tapSpread(Math.floor(step / SCORE_TAPS)));
    const value = layout.plate[Math.min(layout.height - 1, Math.max(0, y)) * layout.width + Math.min(layout.width - 1, Math.max(0, x))];
    sum += value;
    squares += value * value;
  }
  const taps = SCORE_TAPS * SCORE_TAPS;
  return squares / taps - (sum / taps) ** 2;
};

const placeWindow = (layout: WindowLayout, index: number, window: SpectralWindow, slot: WindowSlot): SpectralWindow => {
  let best = { score: -1, x: slot.centreX, y: slot.centreY };
  for (let trial = 0; trial < PLACEMENT_TRIALS; trial++) {
    const x = slot.centreX + (hashUnit(index, 1 + trial * TRIAL_SALT, layout.seed) - HALF_UNIT) * 2 * slot.roomX;
    const y = slot.centreY + (hashUnit(index, 4 + trial * TRIAL_SALT, layout.seed) - HALF_UNIT) * 2 * slot.roomY;
    const score = detailInside(layout, window, x, y);
    if (score > best.score) best = { score, x, y };
  }
  return { ...window, centreX: best.x, centreY: best.y };
};

const windowAt = (layout: WindowLayout, index: number, columns: number, rows: number): SpectralWindow => {
  const slotWidth = (layout.width * (1 - 2 * FRAME_MARGIN)) / columns;
  const slotHeight = (layout.height * (1 - 2 * FRAME_MARGIN)) / rows;
  const window = sizeWindow(layout, index, slotWidth, slotHeight);
  return placeWindow(layout, index, window, {
    centreX: layout.width * FRAME_MARGIN + slotWidth * ((index % columns) + HALF_UNIT),
    centreY: layout.height * FRAME_MARGIN + slotHeight * (Math.floor(index / columns) + HALF_UNIT),
    roomX: HALF_UNIT * slotWidth - window.halfWidth,
    roomY: HALF_UNIT * slotHeight - window.halfHeight,
  });
};

export const layoutWindows = (layout: WindowLayout): SpectralWindow[] => {
  if (layout.count < 1) return [];
  const columns = Math.ceil(Math.sqrt(layout.count));
  const rows = Math.ceil(layout.count / columns);
  return Array.from({ length: layout.count }, (_, index) => windowAt(layout, index, columns, rows));
};

export const windowMask = (window: SpectralWindow, x: number, y: number): number => {
  const distance = Math.max(Math.abs(x - window.centreX) - window.halfWidth, Math.abs(y - window.centreY) - window.halfHeight);
  return 1 - smoothRange(-window.soft, window.soft, distance);
};
