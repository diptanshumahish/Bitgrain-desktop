import type { Frame } from "../../engine/frame";
import type { ParamSpec } from "../../engine/style-types";
import { numberParam, textParam, toggleParam } from "../../engine/resolve-params";
import { pixelParam, type EffectDefinition, type EffectInput } from "../effect-definition";
import type { RgbTriple } from "../pixel-ops";
import { drawForensicCells, drawTextCells, type AsciiCell } from "./ascii-overlay-draw";
import { FORENSIC_GLYPHS } from "./forensic-glyphs";

const CHANNELS = 4;
const CHANNEL_MAX = 255;
const MIN_CELL = 4;
const STRIDE_SHIFT = 2;
const TONE_FLOOR = 0.35;
const TONE_GAIN = 0.65;
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;
const FORENSIC = "forensic";

const CHARSETS: Readonly<Record<string, string>> = {
  [FORENSIC]: FORENSIC_GLYPHS,
  standard: "@%#*+=-:. ",
  blocks: "█▓▒░ ",
  dots: "●◕◑◔∙ ",
  minimal: "#=-. ",
  binary: "10 ",
};

const INKS: Readonly<Record<string, RgbTriple>> = {
  green: [80, 255, 130],
  amber: [255, 190, 60],
  white: [240, 240, 245],
};

const averageCell = (frame: Frame, left: number, top: number, cell: number): RgbTriple => {
  const data = frame.pixels().data;
  const stride = Math.max(1, cell >> STRIDE_SHIFT);
  const total: RgbTriple = [0, 0, 0];
  let count = 0;
  for (let y = top; y < Math.min(frame.height, top + cell); y += stride) {
    for (let x = left; x < Math.min(frame.width, left + cell); x += stride) {
      const index = (y * frame.width + x) * CHANNELS;
      total[0] += data[index];
      total[1] += data[index + 1];
      total[2] += data[index + 2];
      count++;
    }
  }
  return [total[0] / count, total[1] / count, total[2] / count];
};

const cellInk = (average: RgbTriple, level: number, colourMode: string): RgbTriple => {
  const ink = INKS[colourMode];
  if (!ink) return average;
  const shade = TONE_FLOOR + TONE_GAIN * level;
  return [ink[0] * shade, ink[1] * shade, ink[2] * shade];
};

const collectCells = (input: EffectInput, cell: number, glyphs: string): AsciiCell[] => {
  const { frame, values } = input;
  const invert = toggleParam(values, "invert");
  const colourMode = textParam(values, "colour");
  const cells: AsciiCell[] = [];
  for (let top = 0; top < frame.height; top += cell) {
    for (let left = 0; left < frame.width; left += cell) {
      const average = averageCell(frame, left, top, cell);
      const level = (LUMA_R * average[0] + LUMA_G * average[1] + LUMA_B * average[2]) / CHANNEL_MAX;
      const glyph = glyphs[Math.round((invert ? level : 1 - level) * (glyphs.length - 1))];
      if (glyph !== " ") cells.push({ left, top, glyph, colour: cellInk(average, level, colourMode) });
    }
  }
  return cells;
};

const applyAsciiOverlay = (input: EffectInput): void => {
  const cell = Math.max(MIN_CELL, Math.round(numberParam(input.values, "size")));
  const charset = textParam(input.values, "charset");
  const glyphs = CHARSETS[charset] ?? FORENSIC_GLYPHS;
  const cells = collectCells(input, cell, glyphs);
  if (charset === FORENSIC) drawForensicCells(input.frame, cells, cell);
  else drawTextCells(input.frame, cells, cell);
};

const select = (key: string, label: string, options: [string, string][], fallback: string, advanced: boolean): ParamSpec => ({
  kind: "select", key, label, options: options.map(([value, text]) => ({ value, label: text })), default: fallback, advanced,
});

export const ASCII_OVERLAY_EFFECT: EffectDefinition = {
  key: "asciiOverlay",
  label: "ASCII overlay",
  hint: "Redraw the finished picture as text",
  params: [
    pixelParam("size", "Size", 4, 64, 12),
    select("charset", "Characters", [[FORENSIC, "Forensic"], ["standard", "Standard"], ["blocks", "Blocks"], ["dots", "Dots"], ["minimal", "Minimal"], ["binary", "Binary"]], FORENSIC, false),
    select("colour", "Colour", [["source", "From image"], ["green", "Terminal green"], ["amber", "Amber"], ["white", "White"]], "source", true),
    { kind: "toggle", key: "invert", label: "Invert", default: false, advanced: true },
  ],
  apply: applyAsciiOverlay,
};
