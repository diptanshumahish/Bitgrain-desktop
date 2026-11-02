import type { SourceImage } from "../../../engine/style-definition";
import type { RgbTriple } from "../../../postfx/pixel-ops";
import { sourceColourAt } from "../shared/cell-colour";
import { CHANNEL_MAX, lumaOf } from "../shared/colour";
import type { FieldGrid } from "../shared/image-fields";
import { buildSubjectMask, maskAtUnit } from "../shared/subject-mask";
import { downscaleSource } from "../shared/source-canvas";

const ANALYSIS_EDGE = 600;
const PUNCH = 1.35;
const BRIGHTNESS_PUNCH = 1.5;
const CONFINE_TOLERANCE_BASE = 24;
const CONFINE_TOLERANCE_GAIN = 100;
const CONFINE_SOFTNESS = 45;
const CONFINE_RADIAL = 0.6;
const MASK_CUTOFF = 0.35;

export interface LatticeGrid {
  columns: number;
  rows: number;
  pitch: number;
  active: Uint8Array;
  luma: Float32Array;
  colours: RgbTriple[];
}

interface LatticeOptions {
  pitch: number;
  threshold: number;
  confine: number;
  brightness: number;
  colourMode: string;
}

interface NodeSampling {
  analysis: SourceImage;
  ratio: number;
  mask: FieldGrid;
  options: LatticeOptions;
  width: number;
  height: number;
}

const displayColour = (colour: RgbTriple, brightness: number, mode: string): RgbTriple => {
  if (mode === "mono") return [CHANNEL_MAX, CHANNEL_MAX, CHANNEL_MAX];
  const lift = CHANNEL_MAX * brightness * BRIGHTNESS_PUNCH;
  const punchy = colour.map((channel) => Math.min(CHANNEL_MAX, (channel + lift) * PUNCH)) as RgbTriple;
  if (mode !== "vivid") return punchy;
  const peak = Math.max(1, ...punchy);
  return punchy.map((channel) => (channel * CHANNEL_MAX) / peak) as RgbTriple;
};

const fillNode = (grid: LatticeGrid, sampling: NodeSampling, column: number, row: number): void => {
  const { analysis, ratio, mask, options, width, height } = sampling;
  const index = row * grid.columns + column;
  const colour = sourceColourAt(analysis, column * grid.pitch * ratio, row * grid.pitch * ratio);
  grid.luma[index] = lumaOf(colour[0], colour[1], colour[2]) / CHANNEL_MAX;
  grid.colours[index] = displayColour(colour, options.brightness, options.colourMode);
  const subject = maskAtUnit(mask, (column * grid.pitch) / width, (row * grid.pitch) / height);
  grid.active[index] = grid.luma[index] >= options.threshold && subject > MASK_CUTOFF ? 1 : 0;
};

const samplingFor = (source: SourceImage, options: LatticeOptions): NodeSampling => {
  const analysis = downscaleSource(source, ANALYSIS_EDGE);
  const tolerance = CONFINE_TOLERANCE_BASE + CONFINE_TOLERANCE_GAIN * options.confine;
  return {
    analysis, ratio: analysis.width / source.width, options, width: source.width, height: source.height,
    mask: buildSubjectMask(analysis, { tolerance, softness: CONFINE_SOFTNESS, radial: CONFINE_RADIAL }),
  };
};

export const buildLattice = (source: SourceImage, options: LatticeOptions): LatticeGrid => {
  const sampling = samplingFor(source, options);
  const columns = Math.floor(source.width / options.pitch) + 1;
  const rows = Math.floor(source.height / options.pitch) + 1;
  const grid: LatticeGrid = { columns, rows, pitch: options.pitch, active: new Uint8Array(columns * rows), luma: new Float32Array(columns * rows), colours: [] };
  for (let row = 0; row < rows; row++) {
    for (let column = 0; column < columns; column++) fillNode(grid, sampling, column, row);
  }
  return grid;
};
