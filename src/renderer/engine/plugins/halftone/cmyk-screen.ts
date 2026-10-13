import { buildCellGrid } from "./cell-grid";
import { coverageAt, type CoverageHit, type CoverageProbe } from "./grid-coverage";
import type { Rgb } from "./sample-bilinear";
import type { ScreenJob } from "./screen-types";
import { ADDITIVE_LIGHTS, SUBTRACTIVE_INKS, type ProcessInks } from "./process-inks";
import { isLightPaper } from "../../tone/paper";

const WHITE_PAPER: Rgb = [255, 255, 255];

export const processInksFor = (paper: Rgb | undefined): ProcessInks =>
  paper && !isLightPaper(paper) ? ADDITIVE_LIGHTS : SUBTRACTIVE_INKS;

const buildProbes = (job: ScreenJob, process: ProcessInks): CoverageProbe[] =>
  process.angles.map((angle, channel) => ({
    grid: buildCellGrid({
      source: job.source,
      width: job.width,
      height: job.height,
      cellPx: job.cellPx,
      angleDegrees: angle + job.angleWobble,
      intensity: job.intensity,
      shape: job.shape,
      resolveInk: (sample) => process.densityFor(sample, channel),
    }),
    cellPx: job.cellPx,
    edgeWidth: job.edgeWidth,
    shape: job.shape,
    grit: job.grit,
  }));

export const renderCmykScreen = (job: ScreenJob): void => {
  const { width, height, outScale, out } = job;
  const process = processInksFor(job.paper);
  const probes = buildProbes(job, process);
  const basePaper = job.paper ?? WHITE_PAPER;
  const hit: CoverageHit = { coverage: 0, cell: -1 };
  const paper: Rgb = [0, 0, 0];
  const outWidth = Math.round(width * outScale);
  const outHeight = Math.round(height * outScale);
  for (let py = 0; py < outHeight; py++) {
    const offsetY = (py + 0.5) / outScale - height / 2;
    for (let px = 0; px < outWidth; px++) {
      const offsetX = (px + 0.5) / outScale - width / 2;
      paper[0] = basePaper[0]; paper[1] = basePaper[1]; paper[2] = basePaper[2];
      for (let channel = 0; channel < probes.length; channel++) {
        coverageAt(probes[channel], offsetX, offsetY, hit);
        if (hit.coverage > 0) process.blend(paper, process.inks[channel], hit.coverage);
      }
      const index = (py * outWidth + px) * 4;
      out[index] = paper[0];
      out[index + 1] = paper[1];
      out[index + 2] = paper[2];
      out[index + 3] = 255;
    }
  }
};
