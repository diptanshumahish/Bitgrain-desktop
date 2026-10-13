import { buildCellGrid } from "./cell-grid";
import { coverageAt, type CoverageHit, type CoverageProbe } from "./grid-coverage";
import { resolveDotInk } from "./dot-ink";
import type { Rgb } from "./sample-bilinear";
import type { ScreenJob } from "./screen-types";
import { inkForPaper, isLightPaper } from "../../tone/paper";

const WHITE: Rgb = [255, 255, 255];
const BLACK: Rgb = [0, 0, 0];

export const renderSingleScreen = (job: ScreenJob): void => {
  const { width, height, outScale, out } = job;
  const onPaper = job.paper ? isLightPaper(job.paper) : job.invert;
  const monoInk = job.paper && job.style !== "color" ? inkForPaper(job.paper) : null;
  const grid = buildCellGrid({
    source: job.source,
    width,
    height,
    cellPx: job.cellPx,
    angleDegrees: job.baseAngle + job.angleWobble,
    intensity: job.intensity,
    shape: job.shape,
    resolveInk: (sample, colourOut) => {
      const density = resolveDotInk(sample, job.style, onPaper, colourOut);
      if (monoInk) { colourOut[0] = monoInk[0]; colourOut[1] = monoInk[1]; colourOut[2] = monoInk[2]; }
      return density;
    },
  });
  const probe: CoverageProbe = { grid, cellPx: job.cellPx, edgeWidth: job.edgeWidth, shape: job.shape, grit: job.grit };
  const paper = job.paper ?? (onPaper ? WHITE : BLACK);
  const hit: CoverageHit = { coverage: 0, cell: -1 };
  const outWidth = Math.round(width * outScale);
  const outHeight = Math.round(height * outScale);
  for (let py = 0; py < outHeight; py++) {
    const offsetY = (py + 0.5) / outScale - height / 2;
    for (let px = 0; px < outWidth; px++) {
      coverageAt(probe, (px + 0.5) / outScale - width / 2, offsetY, hit);
      const index = (py * outWidth + px) * 4;
      for (let channel = 0; channel < 3; channel++) {
        const ink = hit.cell < 0 ? paper[channel] : grid.colour[hit.cell * 3 + channel];
        out[index + channel] = paper[channel] + (ink - paper[channel]) * hit.coverage;
      }
      out[index + 3] = 255;
    }
  }
};
