import type { FrameRenderInput, FrameStyleDefinition, SourceImage } from "../../../../engine/style-definition";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { hexToRgbTriple } from "../../../../postfx/pixel-ops";
import { cellSizeParam } from "../../../shared-params";
import { CHANNEL_MAX, CHANNELS, PERCENT, clampUnit, sineHash } from "../shared/screen-math";
import { pixelIndexAt } from "../shared/pixel-buffers";

interface DotPass {
  source: SourceImage;
  output: Uint8ClampedArray;
  cell: number;
  radius: number;
  jitter: number;
  square: boolean;
  columns: number;
}

const MIN_CELL = 2;
const SECOND_HASH_OFFSET = 7;
const MIN_RADIUS = 0.25;
const TONE_CONTRAST = 20;

const BACKGROUNDS: Readonly<Record<string, string>> = { black: "#000000", white: "#ffffff", cream: "#efe9d9", charcoal: "#1a1a1a" };

const BACKGROUND_OPTIONS = [
  { value: "black", label: "Black" },
  { value: "white", label: "White" },
  { value: "cream", label: "Cream" },
  { value: "charcoal", label: "Charcoal" },
];

const coverageAt = (pass: DotPass, deltaX: number, deltaY: number): number => {
  if (pass.square) return Math.min(clampUnit(pass.radius - Math.abs(deltaX) + 0.5), clampUnit(pass.radius - Math.abs(deltaY) + 0.5));
  return clampUnit(pass.radius - Math.sqrt(deltaX * deltaX + deltaY * deltaY) + 0.5);
};

const stampDot = (pass: DotPass, centreX: number, centreY: number, colourIndex: number): void => {
  const { source, output } = pass;
  const reach = pass.radius + 1;
  const top = Math.max(0, Math.floor(centreY - reach));
  const bottom = Math.min(source.height - 1, Math.ceil(centreY + reach));
  const left = Math.max(0, Math.floor(centreX - reach));
  const right = Math.min(source.width - 1, Math.ceil(centreX + reach));
  for (let y = top; y <= bottom; y++) {
    for (let x = left; x <= right; x++) {
      const coverage = coverageAt(pass, x + 0.5 - centreX, y + 0.5 - centreY);
      if (coverage <= 0) continue;
      const index = (y * source.width + x) * CHANNELS;
      for (let channel = 0; channel < 3; channel++) output[index + channel] += (source.data[colourIndex + channel] - output[index + channel]) * coverage;
    }
  }
};

const drawCell = (pass: DotPass, column: number, row: number): void => {
  const id = row * (pass.columns + 1) + column;
  const centreX = (column + 0.5 + (sineHash(id) - 0.5) * pass.jitter) * pass.cell;
  const centreY = (row + 0.5 + (sineHash(id + SECOND_HASH_OFFSET) - 0.5) * pass.jitter) * pass.cell;
  stampDot(pass, centreX, centreY, pixelIndexAt(pass.source, Math.floor(centreX), Math.floor(centreY)));
};

const backgroundBuffer = (source: SourceImage, hex: string): Uint8ClampedArray => {
  const [red, green, blue] = hexToRgbTriple(hex);
  const output = new Uint8ClampedArray(source.data.length);
  for (let index = 0; index < output.length; index += CHANNELS) {
    output[index] = red;
    output[index + 1] = green;
    output[index + 2] = blue;
    output[index + 3] = CHANNEL_MAX;
  }
  return output;
};

const renderPointillize = ({ frame, source, params }: FrameRenderInput): void => {
  const toned = toneAdjustedSource(source, params);
  const cell = Math.max(MIN_CELL, numberParam(params, "size"));
  const columns = Math.ceil(source.width / cell);
  const pass: DotPass = {
    source: toned, output: backgroundBuffer(source, BACKGROUNDS[textParam(params, "background")] ?? BACKGROUNDS.black),
    cell, columns, radius: 0.5 * cell * Math.min(1, numberParam(params, "fill") / PERCENT),
    jitter: numberParam(params, "jitter") / PERCENT, square: textParam(params, "shape") === "square",
  };
  if (pass.radius >= MIN_RADIUS) {
    for (let row = 0; row < Math.ceil(source.height / cell); row++) {
      for (let column = 0; column < columns; column++) drawCell(pass, column, row);
    }
  }
  frame.writePixels(pass.output);
};

export const POINTILLIZE_STYLE: FrameStyleDefinition = {
  id: "pointillize",
  label: "Pointillize",
  hint: "Scattered dabs of colour on a plain ground",
  glyph: "⣿",
  category: "print",
  kind: "frame",
  params: [
    cellSizeParam("Dot size", 9),
    { kind: "number", key: "fill", label: "Fill", min: 10, max: 100, step: 1, default: 95, suffix: "%" },
    { kind: "select", key: "background", label: "Background", options: BACKGROUND_OPTIONS, default: "charcoal" },
    { kind: "number", key: "jitter", label: "Scatter", min: 0, max: 100, step: 1, default: 20, suffix: "%", advanced: true },
    { kind: "select", key: "shape", label: "Shape", options: [{ value: "circle", label: "Round" }, { value: "square", label: "Square" }], default: "circle", advanced: true },
    ...frameToneParams(TONE_CONTRAST),
  ],
  renderFrame: renderPointillize,
};
