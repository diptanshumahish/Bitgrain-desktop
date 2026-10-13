import type { Palette } from "../../types";
import { dotRadiusFor } from "../../plugins/halftone/halftone-coverage";
import { sampleBilinear, type Rgb } from "../../plugins/halftone/sample-bilinear";
import { resolveDotInk } from "../../plugins/halftone/dot-ink";
import { processInksFor } from "../../plugins/halftone/cmyk-screen";
import { ADDITIVE_LIGHTS, type ProcessInks } from "../../plugins/halftone/process-inks";
import type { HalftoneShape, HalftoneStyle } from "../../plugins/halftone/halftone-defaults";
import { getNearestColor } from "../../utils/color";
import { quantizedHex } from "./svg-format";
import { inkForPaper, isLightPaper } from "../../tone/paper";

export interface HalftoneVectorParams {
  cellPx: number;
  edgeWidth: number;
  angle: number;
  style: HalftoneStyle;
  shape: HalftoneShape;
  intensity: number;
  invert: boolean;
  paper?: Rgb;
  palette: Palette | null;
}

export interface VectorDot {
  col: number;
  row: number;
  radius: number;
  fill: string;
}

export interface DotScreen {
  angle: number;
  blend: "normal" | "multiply" | "screen";
  dots: VectorDot[];
}

export interface ScreenSource {
  data: Float32Array;
  width: number;
  height: number;
}

type InkResolver = (sample: Rgb, colourOut: Rgb) => number;

const DEGREES_TO_RADIANS = Math.PI / 180;
const MIN_DOT_RADIUS = 0.03;
const GRID_MARGIN_CELLS = 1;
const SOFT_EDGE_AREA_DIVISOR = 12;

const clampUnit = (value: number): number => Math.min(1, Math.max(0, value));

const resolveFill = (colour: Rgb, palette: Palette | null): string => {
  if (!palette) return quantizedHex(colour[0], colour[1], colour[2]);
  const [red, green, blue] = getNearestColor(colour[0], colour[1], colour[2], palette);
  return quantizedHex(red, green, blue);
};

const visibleRadius = (radius: number, edgeWidth: number): number =>
  radius <= 0 ? 0 : Math.sqrt(radius * radius + (edgeWidth * edgeWidth) / SOFT_EDGE_AREA_DIVISOR);

const isOutsideFrame = (x: number, y: number, source: ScreenSource, margin: number): boolean =>
  x < -margin || y < -margin || x > source.width + margin || y > source.height + margin;

const traceScreen = (
  source: ScreenSource,
  params: HalftoneVectorParams,
  angleDegrees: number,
  resolveInk: InkResolver,
): VectorDot[] => {
  const cell = params.cellPx;
  const cosA = Math.cos(angleDegrees * DEGREES_TO_RADIANS);
  const sinA = Math.sin(angleDegrees * DEGREES_TO_RADIANS);
  const reach = Math.ceil(Math.hypot(source.width, source.height) / 2 / cell) + GRID_MARGIN_CELLS;
  const sample: Rgb = [0, 0, 0];
  const colour: Rgb = [0, 0, 0];
  const dots: VectorDot[] = [];
  for (let row = -reach; row <= reach; row++) {
    for (let col = -reach; col <= reach; col++) {
      const centerX = source.width / 2 + (col * cosA - row * sinA) * cell;
      const centerY = source.height / 2 + (col * sinA + row * cosA) * cell;
      if (isOutsideFrame(centerX, centerY, source, cell)) continue;
      sampleBilinear(source.data, source.width, source.height, centerX, centerY, sample);
      const density = clampUnit(resolveInk(sample, colour) * params.intensity);
      const radius = visibleRadius(dotRadiusFor(density, cell, params.shape), params.edgeWidth) / cell;
      if (radius >= MIN_DOT_RADIUS) dots.push({ col, row, radius, fill: resolveFill(colour, params.palette) });
    }
  }
  return dots;
};

const singleScreen = (source: ScreenSource, params: HalftoneVectorParams): DotScreen[] => {
  const onPaper = params.paper ? isLightPaper(params.paper) : params.invert;
  const monoInk = params.paper && params.style !== "color" ? inkForPaper(params.paper) : null;
  const resolveInk: InkResolver = (sample, colourOut) => {
    const density = resolveDotInk(sample, params.style, onPaper, colourOut);
    if (monoInk) { colourOut[0] = monoInk[0]; colourOut[1] = monoInk[1]; colourOut[2] = monoInk[2]; }
    return density;
  };
  return [{ angle: params.angle, blend: "normal", dots: traceScreen(source, params, params.angle, resolveInk) }];
};

const processInkResolver = (process: ProcessInks, channel: number): InkResolver => (sample, colourOut) => {
  colourOut[0] = process.inks[channel][0];
  colourOut[1] = process.inks[channel][1];
  colourOut[2] = process.inks[channel][2];
  return process.densityFor(sample, channel);
};

const cmykScreens = (source: ScreenSource, params: HalftoneVectorParams): DotScreen[] => {
  const process = processInksFor(params.paper);
  const blend = process === ADDITIVE_LIGHTS ? "screen" : "multiply";
  return process.angles.map((angle, channel) => ({
    angle,
    blend,
    dots: traceScreen(source, params, angle, processInkResolver(process, channel)),
  }));
};

export const buildHalftoneScreens = (source: ScreenSource, params: HalftoneVectorParams): DotScreen[] =>
  params.style === "cmyk" ? cmykScreens(source, params) : singleScreen(source, params);
