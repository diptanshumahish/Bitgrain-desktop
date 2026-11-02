import type { CellRenderInput, CellStyleDefinition } from "../../engine/style-definition";
import { numberParam, toggleParam } from "../../engine/resolve-params";
import { pointColour, squareCellGrid, type Rgb } from "../../finish/cell-grid";
import { adjustColour, buildCellTone, culledByBrightness, GATE_BASE_DENSE, invertColour, lumaOf, rgbaOf, toneOf, type CellTone } from "../../finish/cell-tone";
import { FINISH_KEYS } from "../../finish/finish-params";
import { CELL_SIZE_KEY, cellSizeParam } from "../shared-params";
import { TILE_CONTRAST } from "./tile-pass";

const SQRT_THREE = Math.sqrt(3);
const HALF_SQRT_THREE = SQRT_THREE / 2;
const ROW_STEP = 1.5;
const CHANNELS = 4;
const PERCENT = 100;
const CHANNEL_MAX = 255;
const OUTLINE_WIDTH = 0.05;
const KEYS = { top: "topShade", light: "lightShade", dark: "darkShade", outline: "outline", flip: "flip" } as const;

interface CubePass {
  input: CellRenderInput;
  tone: CellTone;
  alpha: number;
  radius: number;
  shades: [number, number, number];
  outline: number;
}

type Point = [number, number];

const shaded = (colour: Rgb, shade: number): Rgb =>
  [Math.min(CHANNEL_MAX, colour[0] * shade), Math.min(CHANNEL_MAX, colour[1] * shade), Math.min(CHANNEL_MAX, colour[2] * shade)];

const fillFace = (pass: CubePass, points: Point[], colour: Rgb, shade: number): void => {
  const layer = pass.input.layer;
  layer.fillStyle = rgbaOf(shaded(colour, shade), pass.alpha);
  layer.beginPath();
  points.forEach(([x, y], index) => (index === 0 ? layer.moveTo(x, y) : layer.lineTo(x, y)));
  layer.closePath();
  layer.fill();
  if (pass.outline > 0) layer.stroke();
};

const cubeColour = (pass: CubePass, x: number, y: number): Rgb | null => {
  const { source } = pass.input;
  const index = (Math.min(source.height - 1, Math.max(0, Math.floor(y))) * source.width + Math.min(source.width - 1, Math.max(0, Math.floor(x)))) * CHANNELS;
  const raw = pointColour(source, index);
  if (culledByBrightness(pass.tone, toneOf(pass.tone, lumaOf(raw[0], raw[1], raw[2])))) return null;
  const adjusted = adjustColour(pass.tone, raw);
  return pass.tone.invert ? invertColour(adjusted) : adjusted;
};

const drawCube = (pass: CubePass, x: number, y: number): void => {
  const colour = cubeColour(pass, x, y);
  if (!colour) return;
  const radius = pass.radius;
  const side = HALF_SQRT_THREE * radius;
  const half = radius / 2;
  fillFace(pass, [[x, y - radius], [x + side, y - half], [x, y], [x - side, y - half]], colour, pass.shades[0]);
  fillFace(pass, [[x + side, y - half], [x + side, y + half], [x, y + radius], [x, y]], colour, pass.shades[1]);
  fillFace(pass, [[x - side, y - half], [x, y], [x, y + radius], [x - side, y + half]], colour, pass.shades[2]);
};

const buildCubePass = (input: CellRenderInput): CubePass => {
  const { params, source } = input;
  const radius = Math.max(2, numberParam(params, CELL_SIZE_KEY)) / 2;
  const light = numberParam(params, KEYS.light) / PERCENT;
  const dark = numberParam(params, KEYS.dark) / PERCENT;
  const flip = toggleParam(params, KEYS.flip);
  return {
    input,
    tone: buildCellTone(source, squareCellGrid(source.width, source.height, radius * 2), params, GATE_BASE_DENSE),
    alpha: numberParam(params, FINISH_KEYS.opacity) / PERCENT,
    radius,
    shades: [numberParam(params, KEYS.top) / PERCENT, flip ? dark : light, flip ? light : dark],
    outline: numberParam(params, KEYS.outline) / PERCENT,
  };
};

const drawVoxels = (input: CellRenderInput): void => {
  const pass = buildCubePass(input);
  const columnStep = SQRT_THREE * pass.radius;
  const rowStep = ROW_STEP * pass.radius;
  input.layer.strokeStyle = `rgba(0,0,0,${pass.outline * pass.alpha})`;
  input.layer.lineWidth = Math.max(0.5, OUTLINE_WIDTH * pass.radius);
  const rows = Math.ceil(input.source.height / rowStep) + 2;
  const columns = Math.ceil(input.source.width / columnStep) + 2;
  for (let row = 0; row < rows; row++) {
    const offset = row % 2 === 0 ? 0 : columnStep / 2;
    for (let column = 0; column < columns; column++) drawCube(pass, column * columnStep + offset, row * rowStep + pass.radius);
  }
};

export const VOXEL_STYLE: CellStyleDefinition = {
  id: "voxel",
  label: "Voxel",
  hint: "Stacked isometric cubes",
  glyph: "⬢",
  category: "pixel",
  kind: "cells",
  params: [
    cellSizeParam("Cube size", 12, 4),
    { kind: "number", key: KEYS.top, label: "Top light", min: 50, max: 200, step: 1, default: 135, advanced: true },
    { kind: "number", key: KEYS.light, label: "Light side", min: 30, max: 150, step: 1, default: 100, advanced: true },
    { kind: "number", key: KEYS.dark, label: "Dark side", min: 20, max: 150, step: 1, default: 55, advanced: true },
    { kind: "number", key: KEYS.outline, label: "Outline", min: 0, max: 50, step: 5, default: 0, advanced: true },
    { kind: "toggle", key: KEYS.flip, label: "Light from left", default: false, advanced: true },
  ],
  finishDefaults: { [FINISH_KEYS.backdrop]: "solid", [FINISH_KEYS.contrast]: TILE_CONTRAST },
  drawCells: drawVoxels,
};
