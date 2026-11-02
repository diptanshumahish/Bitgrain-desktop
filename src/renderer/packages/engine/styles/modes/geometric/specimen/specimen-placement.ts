import type { Candidate, CandidateSet } from "./specimen-candidates";

const REGION_COLUMNS = 3;
const REGION_ROWS = 2;
const MARGIN = 4;
const OVERLAP_PAD = 3;
const LABEL_GAP = 2;
const LABEL_CHAR_WIDTH = 0.62;
const BOX_SHARE = 0.055;
const SIZE_BASE = 0.45;
const SIZE_GAIN = 0.75;
const MIN_HALF = 7;
const MIN_HALF_LINES = 3;

export interface PlacedBox {
  x: number;
  y: number;
  half: number;
  label: string;
}

interface PlacementOptions {
  width: number;
  height: number;
  scale: number;
  count: number;
  boxSize: number;
  lineWidth: number;
  fontSize: number;
  showLabels: boolean;
}

interface Rect {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const coordinateLabel = (candidate: Candidate, scale: number): string =>
  `x: ${Math.round(candidate.x / scale)}  y: ${Math.round(candidate.y / scale)}`;

const halfSize = (candidate: Candidate, set: CandidateSet, options: PlacementOptions): number => {
  const minimum = Math.max(MIN_HALF * options.scale, MIN_HALF_LINES * options.lineWidth);
  const grown = BOX_SHARE * Math.min(options.width, options.height) * (SIZE_BASE + (SIZE_GAIN * candidate.edge) / set.maxEdge) * options.boxSize;
  return Math.max(minimum, grown);
};

const footprint = (box: PlacedBox, options: PlacementOptions): Rect => {
  const labelHeight = options.showLabels ? options.fontSize + LABEL_GAP * options.scale : 0;
  const labelWidth = options.showLabels ? box.label.length * options.fontSize * LABEL_CHAR_WIDTH : 0;
  return {
    left: box.x - box.half, top: box.y - box.half - labelHeight,
    right: Math.max(box.x + box.half, box.x - box.half + labelWidth), bottom: box.y + box.half,
  };
};

const fits = (rect: Rect, placed: Rect[], options: PlacementOptions): boolean => {
  const margin = MARGIN * options.scale;
  const pad = OVERLAP_PAD * options.scale;
  if (rect.left < margin || rect.top < margin || rect.right > options.width - margin || rect.bottom > options.height - margin) return false;
  return placed.every((other) => rect.right + pad < other.left || rect.left - pad > other.right || rect.bottom + pad < other.top || rect.top - pad > other.bottom);
};

const regionOf = (candidate: Candidate, options: PlacementOptions): number =>
  Math.min(REGION_ROWS - 1, Math.floor((candidate.y / options.height) * REGION_ROWS)) * REGION_COLUMNS +
  Math.min(REGION_COLUMNS - 1, Math.floor((candidate.x / options.width) * REGION_COLUMNS));

const takeFromRegion = (queue: Candidate[], set: CandidateSet, placed: Rect[], options: PlacementOptions): PlacedBox | null => {
  while (queue.length > 0) {
    const candidate = queue.shift() as Candidate;
    const box = { x: candidate.x, y: candidate.y, half: halfSize(candidate, set, options), label: coordinateLabel(candidate, options.scale) };
    const rect = footprint(box, options);
    if (!fits(rect, placed, options)) continue;
    placed.push(rect);
    return box;
  }
  return null;
};

export const placeBoxes = (set: CandidateSet, options: PlacementOptions, regionOrder: readonly number[]): PlacedBox[] => {
  const queues: Candidate[][] = Array.from({ length: REGION_COLUMNS * REGION_ROWS }, () => []);
  for (const candidate of set.candidates) queues[regionOf(candidate, options)].push(candidate);
  const placed: Rect[] = [];
  const boxes: PlacedBox[] = [];
  let progressed = true;
  while (boxes.length < options.count && progressed) {
    progressed = false;
    for (const region of regionOrder) {
      const box = boxes.length < options.count ? takeFromRegion(queues[region], set, placed, options) : null;
      if (box) boxes.push(box);
      progressed = progressed || box !== null;
    }
  }
  return boxes;
};

export const REGION_COUNT = REGION_COLUMNS * REGION_ROWS;
