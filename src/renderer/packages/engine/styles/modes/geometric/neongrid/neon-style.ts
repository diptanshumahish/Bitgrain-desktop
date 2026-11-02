import { Frame } from "../../../engine/frame";
import type { FrameRenderInput, FrameStyleDefinition, SourceImage } from "../../../engine/style-definition";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { drawSoftCopy, softCopy } from "../../../finish/soft-copy";
import { CHANNELS, hexTriple, hueAndSaturation } from "../shared/colour";
import { colourSpec, numberSpec } from "../shared/param-builders";
import { buildNeonField } from "./neon-fields";
import { paintNeonTiles } from "./neon-paint";
import { buildTiles, type NeonTile } from "./neon-tiles";

const PERCENT = 100;
const REFERENCE_WIDTH = 900;
const TILE_BASE = 4;
const TILE_GAIN = 24;
const MIN_UNITS = 3;
const UNIT_TO_TILE = 2.1;
const MIN_TILE = 14;
const PLATE: readonly [number, number, number] = [0.11, 0.13, 0.19];
const NEAR_BLOOM = [0.4, 0.9, 0.3, 0.7, 0.38, 0.62] as const;
const WIDE_BLOOM = [1.6, 3.2, 0.22, 0.6, 0.12, 0.88] as const;
const BLOOM_AREA = 0.22;
const MIN_LIT_SHARE = 0.03;

const tileSizeFor = (width: number, scale: number, gridScale: number): number => {
  const units = Math.max(MIN_UNITS, Math.round((width / scale / REFERENCE_WIDTH) * (TILE_BASE + gridScale * TILE_GAIN)));
  return Math.max(MIN_TILE, Math.round(UNIT_TO_TILE * units)) * scale;
};

const paintPlate = (frame: Frame, source: SourceImage): void => {
  const data = new Uint8ClampedArray(source.data.length);
  for (let index = 0; index < data.length; index += CHANNELS) {
    data[index] = source.data[index] * PLATE[0];
    data[index + 1] = source.data[index + 1] * PLATE[1];
    data[index + 2] = source.data[index + 2] * PLATE[2];
    data[index + 3] = source.data[index + 3];
  }
  frame.writePixels(data);
};

const addBloom = (frame: Frame, layer: Frame, sigma: number, alpha: number): void => {
  const context = frame.context;
  context.globalAlpha = Math.min(1, alpha);
  drawSoftCopy(context, softCopy(layer.canvas, layer.width, layer.height, sigma), frame.width, frame.height);
  context.globalAlpha = 1;
};

const compositeNeon = (frame: Frame, layer: Frame, tiles: NeonTile[], tile: number, glow: number): void => {
  const litShare = (tiles.length * tile * tile) / (frame.width * frame.height);
  const emptiness = Math.min(1, BLOOM_AREA / Math.max(MIN_LIT_SHARE, litShare));
  const bloomAlpha = (spec: readonly number[]): number => (spec[2] + spec[3] * glow) * (spec[4] + spec[5] * emptiness);
  frame.context.globalCompositeOperation = "lighter";
  addBloom(frame, layer, tile * (WIDE_BLOOM[0] + WIDE_BLOOM[1] * glow), bloomAlpha(WIDE_BLOOM));
  addBloom(frame, layer, tile * (NEAR_BLOOM[0] + NEAR_BLOOM[1] * glow), bloomAlpha(NEAR_BLOOM));
  frame.context.drawImage(layer.canvas, 0, 0);
  frame.context.globalCompositeOperation = "source-over";
};

const renderNeonGrid = (input: FrameRenderInput): void => {
  const { frame, params, scale } = input;
  const source = toneAdjustedSource(input.source, params);
  const tile = tileSizeFor(frame.width, scale, numberParam(params, "gridScale") / PERCENT);
  const field = buildNeonField(source, tile / 2, numberParam(params, "confine") / PERCENT);
  const tiles = buildTiles(field, { warp: numberParam(params, "warp") / PERCENT, scale });
  const [hue, saturation] = hueAndSaturation(hexTriple(textParam(params, "colour")));
  const glow = numberParam(params, "glow") / PERCENT;
  const layer = new Frame(frame.width, frame.height);
  paintNeonTiles(layer.context, tiles, { hue, saturation, glow });
  paintPlate(frame, source);
  compositeNeon(frame, layer, tiles, tile, glow);
};

export const NEONGRID_STYLE: FrameStyleDefinition = {
  id: "neongrid",
  label: "Neon grid",
  hint: "Glowing tiles that bulge with the light",
  glyph: "▩",
  category: "geometric",
  kind: "frame",
  params: [
    colourSpec("colour", "Colour", "#69ffeb"),
    numberSpec({ key: "gridScale", label: "Tile size", min: 0, max: 100, value: 0, suffix: "%" }),
    numberSpec({ key: "glow", label: "Glow", min: 0, max: 100, value: 60, suffix: "%" }),
    numberSpec({ key: "warp", label: "Warp", min: 0, max: 100, value: 35, suffix: "%", advanced: true }),
    numberSpec({ key: "confine", label: "Subject focus", min: 0, max: 100, value: 65, suffix: "%", advanced: true, hint: "Higher keeps the grid on the main subject" }),
    ...frameToneParams(),
  ],
  renderFrame: renderNeonGrid,
};
