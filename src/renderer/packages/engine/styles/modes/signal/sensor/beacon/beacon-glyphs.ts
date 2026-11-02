import type { DrawContext } from "../../../../engine/frame";
import { BYTE_MAX, CHANNELS, HALF_UNIT } from "../../shared/signal-math";
import type { BeaconGrid } from "./beacon-grid";

const GLYPH_RAMP: readonly string[] = ["■", "8", "X", "*", "+", "·"];
const SKIP_BELOW = 0.06;
const BOOST_BASE = 1.5;
const BOOST_RANGE = 0.7;
const WHITE_START = 0.82;
const WHITE_SPAN = 0.18;
const FONT_BASE = 1.12;
const FONT_SPACING = 0.52;
const RGB = 3;

interface GlyphPaint {
  spacing: number;
  sourceColour: boolean;
}

const glyphColour = (grid: BeaconGrid, index: number, sourceColour: boolean): string => {
  if (!sourceColour) return "#ffffff";
  const luma = grid.luma[index];
  const boost = BOOST_BASE + BOOST_RANGE * luma;
  const whiten = Math.min(1, Math.max(0, (luma - WHITE_START) / WHITE_SPAN));
  const channels: number[] = [];
  for (let channel = 0; channel < RGB; channel++) {
    const lifted = Math.min(BYTE_MAX, grid.colour[index * CHANNELS + channel] * boost);
    channels.push(Math.round(lifted + (BYTE_MAX - lifted) * whiten));
  }
  return `rgb(${channels.join(",")})`;
};

const glyphFor = (luma: number): string =>
  GLYPH_RAMP[Math.min(GLYPH_RAMP.length - 1, Math.floor((1 - luma) * GLYPH_RAMP.length))];

export const drawBeaconGlyphs = (context: DrawContext, grid: BeaconGrid, paint: GlyphPaint): void => {
  const fontSize = Math.max(1, Math.round(grid.cell * (FONT_BASE - FONT_SPACING * paint.spacing)));
  context.font = `${fontSize}px "Courier New", Courier, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  for (let index = 0; index < grid.luma.length; index++) {
    if (grid.luma[index] < SKIP_BELOW) continue;
    const column = index % grid.columns;
    const row = Math.floor(index / grid.columns);
    context.fillStyle = glyphColour(grid, index, paint.sourceColour);
    context.fillText(glyphFor(grid.luma[index]), (column + HALF_UNIT) * grid.cell, (row + HALF_UNIT) * grid.cell);
  }
};
