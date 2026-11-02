import { CHANNEL_MAX, CHANNELS, mix } from "../shared/screen-math";
import { PLATE_COUNT, type PlateFrame, type PlateGrid } from "./cmyk-plates";
import { grainAt, overlayPixel, type GrainSample } from "./cmyk-grain";
import { dropMask, dropRadius, maskShapeFor, mergeDrops, type DropSettings, type MaskShape } from "./cmyk-drop-mask";

export interface DropJob {
  frame: PlateFrame;
  settings: DropSettings;
  channels: Float32Array;
  grids: readonly PlateGrid[];
}

interface DropPass {
  job: DropJob;
  shape: MaskShape;
  radii: Float32Array[];
  sharp: boolean;
  colour: Float32Array;
  grain: GrainSample;
}

const INK_ORDER = [3, 0, 1, 2];
const RGB = 3;

const cellRadii = (job: DropJob, plate: number): Float32Array =>
  job.grids[plate].value.map((value) => dropRadius(job.settings, plate, value));

const neighbourSum = (pass: DropPass, plate: number, gridX: number, gridY: number, sharpRadius: number): number => {
  const grid = pass.job.grids[plate];
  const radii = pass.radii[plate];
  const keep = 1 - pass.grain.shrink;
  const base = (Math.floor(gridY) - grid.rowMin) * grid.columns + Math.floor(gridX) - grid.columnMin;
  let total = 0;
  for (let rowStep = -1; rowStep <= 1; rowStep++) {
    for (let columnStep = -1; columnStep <= 1; columnStep++) {
      const cell = base + rowStep * grid.columns + columnStep;
      const radius = (sharpRadius >= 0 ? sharpRadius : radii[cell]) * keep;
      const deltaX = gridX - grid.centreX[cell];
      const deltaY = gridY - grid.centreY[cell];
      const squared = deltaX * deltaX + deltaY * deltaY;
      if (squared >= radius * radius) continue;
      const mask = dropMask(pass.shape, radius, Math.sqrt(squared));
      total = pass.shape.dots ? Math.max(total, mask) : total + mask;
    }
  }
  return pass.shape.dots ? total : mergeDrops(pass.shape, total);
};

const plateCoverage = (pass: DropPass, plate: number, x: number, y: number): number => {
  const { frame, grids, channels, settings } = pass.job;
  const grid = grids[plate];
  const offsetX = x + 0.5 - frame.width / 2;
  const offsetY = y + 0.5 - frame.height / 2;
  const gridX = (offsetX * grid.cosine + offsetY * grid.sine) / frame.cell + grid.shift;
  const gridY = (offsetY * grid.cosine - offsetX * grid.sine) / frame.cell + grid.shift;
  const sharpRadius = pass.sharp ? dropRadius(settings, plate, channels[(y * frame.width + x) * PLATE_COUNT + plate]) : -1;
  return neighbourSum(pass, plate, gridX, gridY, sharpRadius);
};

const inkPixel = (pass: DropPass, x: number, y: number): number => {
  const { colour } = pass;
  colour.fill(1);
  let shape = 0;
  for (const plate of INK_ORDER) {
    const coverage = plateCoverage(pass, plate, x, y);
    if (coverage <= 0) continue;
    const ink = pass.job.settings.inks[plate];
    for (let channel = 0; channel < RGB; channel++) colour[channel] *= mix(1, ink[channel], coverage);
    shape = Math.max(shape, coverage);
  }
  return shape;
};

const paintPixel = (pass: DropPass, output: Uint8ClampedArray, index: number, shape: number): void => {
  const { paper } = pass.job.settings;
  for (let channel = 0; channel < RGB; channel++) {
    output[index + channel] = overlayPixel(mix(paper[channel], pass.colour[channel], shape), pass.grain) * CHANNEL_MAX;
  }
  output[index + 3] = CHANNEL_MAX;
};

export const renderDrops = (job: DropJob, output: Uint8ClampedArray): void => {
  const pass: DropPass = {
    job,
    shape: maskShapeFor(job.settings, job.frame.cell),
    radii: job.grids.map((_, plate) => cellRadii(job, plate)),
    sharp: job.settings.type === "sharp",
    colour: new Float32Array(RGB),
    grain: { shrink: 0, overlay: 0 },
  };
  const { width, height } = job.frame;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      grainAt(job, x, y, pass.grain);
      paintPixel(pass, output, (y * width + x) * CHANNELS, inkPixel(pass, x, y));
    }
  }
};
