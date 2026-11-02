import type { CellStyleDefinition } from "../../engine/style-definition";
import { numberParam } from "../../engine/resolve-params";
import { cellHash } from "../../engine/seeded-random";
import type { Rgb } from "../../finish/cell-grid";
import { lumaOf, rgbaOf } from "../../finish/cell-tone";
import { FINISH_KEYS } from "../../finish/finish-params";
import { cellSizeParam } from "../shared-params";
import { runTiles, scaledGap, TILE_CONTRAST, type TileCell, type TilePass } from "./tile-pass";

const CHANNEL_MAX = 255;
const PERCENT = 100;
const HASH_BUCKETS = 10000;
const TILE_GAP = 2;
const BOOST = 0.45;
const TOP_LIFT_BASE = 0.3;
const TOP_LIFT_GAIN = 0.45;
const BODY_STOP = 0.18;
const BOTTOM_SHADE = 0.6;
const EDGE_START = 0.45;
const EDGE_GAIN = 1.4;
const SPARKLE_START = 0.55;
const SPARKLE_RANGE = 0.45;
const SPARKLE_ALPHA = 0.55;
const SPARKLE_MID = 0.35;
const SPARKLE_REACH = 1.6;
const UNIFORMITY_KEY = "uniformity";

const towardWhite = (colour: Rgb, amount: number): Rgb =>
  [colour[0] + (CHANNEL_MAX - colour[0]) * amount, colour[1] + (CHANNEL_MAX - colour[1]) * amount, colour[2] + (CHANNEL_MAX - colour[2]) * amount];

const scaled = (colour: Rgb, factor: number): Rgb =>
  [Math.min(CHANNEL_MAX, colour[0] * factor), Math.min(CHANNEL_MAX, colour[1] * factor), Math.min(CHANNEL_MAX, colour[2] * factor)];

const tileGain = (tile: TileCell, uniformity: number): number =>
  1 + ((cellHash(tile.column, tile.row) % HASH_BUCKETS) / HASH_BUCKETS - 0.5) * (1 - uniformity / PERCENT);

const paintSparkle = (pass: TilePass, x: number, y: number, size: number, brightness: number): void => {
  const layer = pass.input.layer;
  const reach = SPARKLE_REACH * size;
  const peak = SPARKLE_ALPHA * pass.alpha * Math.min(1, (brightness - SPARKLE_START) / SPARKLE_RANGE);
  const gradient = layer.createRadialGradient(x, y, 0, x, y, reach);
  gradient.addColorStop(0, `rgba(255,255,255,${peak})`);
  gradient.addColorStop(0.5, `rgba(255,255,255,${SPARKLE_MID * peak})`);
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  layer.globalCompositeOperation = "lighter";
  layer.fillStyle = gradient;
  layer.fillRect(x - reach, y - reach, reach * 2, reach * 2);
  layer.globalCompositeOperation = "source-over";
};

const drawDiscoTile = (pass: TilePass, tile: TileCell, uniformity: number): void => {
  const brightness = lumaOf(tile.colour[0], tile.colour[1], tile.colour[2]) / CHANNEL_MAX;
  const colour = scaled(tile.colour, (1 + BOOST * brightness) * tileGain(tile, uniformity));
  const { cellWidth, cellHeight } = pass.grid;
  const gap = scaledGap(pass, TILE_GAP);
  const left = tile.column * cellWidth + gap / 2;
  const top = tile.row * cellHeight + gap / 2;
  const width = cellWidth - gap;
  const height = cellHeight - gap;
  const layer = pass.input.layer;
  const fill = layer.createLinearGradient(left, top, left, top + height);
  fill.addColorStop(0, rgbaOf(towardWhite(colour, TOP_LIFT_BASE + TOP_LIFT_GAIN * brightness), pass.alpha));
  fill.addColorStop(BODY_STOP, rgbaOf(colour, pass.alpha));
  fill.addColorStop(1, rgbaOf(scaled(colour, BOTTOM_SHADE), pass.alpha));
  layer.fillStyle = fill;
  layer.fillRect(left, top, width, height);
  if (brightness > EDGE_START) {
    layer.fillStyle = `rgba(255,255,255,${pass.alpha * (brightness - EDGE_START) * EDGE_GAIN})`;
    layer.fillRect(left, top, width, 1);
  }
  if (brightness > SPARKLE_START) paintSparkle(pass, left + width / 2, top + height / 2, Math.max(width, height), brightness);
};

export const DISCO_STYLE: CellStyleDefinition = {
  id: "disco",
  label: "Disco",
  hint: "Mirror-ball tiles with sparkle",
  glyph: "◈",
  category: "light",
  kind: "cells",
  params: [
    cellSizeParam("Tile size", 12, 4),
    { kind: "number", key: UNIFORMITY_KEY, label: "Evenness", min: 0, max: 100, step: 1, default: 80, advanced: true },
  ],
  finishDefaults: { [FINISH_KEYS.backdrop]: "solid", [FINISH_KEYS.contrast]: TILE_CONTRAST },
  drawCells: (input) => {
    const uniformity = numberParam(input.params, UNIFORMITY_KEY);
    runTiles(input, "average", (pass, tile) => drawDiscoTile(pass, tile, uniformity));
  },
};
