import { numberParam, textParam } from "../../engine/resolve-params";
import { pixelParam, type EffectDefinition, type EffectInput } from "../effect-definition";

const CHANNELS = 4;
const CHANNEL_MAX = 255;
const HALFTONE_OVER = 0.7;
const MIN_MARK = 0.3;
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;
const FULL_TURN = Math.PI * 2;

const applyPixelate = ({ frame, values }: EffectInput): void => {
  const block = Math.max(1, Math.round(numberParam(values, "size")));
  if (block <= 1) return;
  const small = new OffscreenCanvas(Math.ceil(frame.width / block), Math.ceil(frame.height / block));
  const smallContext = small.getContext("2d");
  if (!smallContext) return;
  smallContext.imageSmoothingEnabled = false;
  smallContext.drawImage(frame.canvas, 0, 0, small.width, small.height);
  const context = frame.context;
  context.imageSmoothingEnabled = false;
  context.drawImage(small, 0, 0, small.width * block, small.height * block);
  context.imageSmoothingEnabled = true;
};

export const PIXELATE_EFFECT: EffectDefinition = {
  key: "pixelate",
  label: "Pixelate",
  hint: "Big square pixels over everything",
  params: [pixelParam("size", "Block size", 2, 30, 4)],
  apply: (input) => {
    input.frame.commit();
    applyPixelate(input);
  },
};

const cellAverage = (data: Uint8ClampedArray, width: number, left: number, top: number, right: number, bottom: number): [number, number, number] => {
  let red = 0;
  let green = 0;
  let blue = 0;
  let count = 0;
  for (let y = top; y < bottom; y++) {
    for (let x = left; x < right; x++) {
      const index = (y * width + x) * CHANNELS;
      red += data[index];
      green += data[index + 1];
      blue += data[index + 2];
      count++;
    }
  }
  return count ? [red / count, green / count, blue / count] : [0, 0, 0];
};

const drawMark = (context: OffscreenCanvasRenderingContext2D, shape: string, x: number, y: number, cell: number, level: number): void => {
  if (shape === "squares") {
    const side = cell * Math.sqrt(level);
    if (side >= MIN_MARK) context.fillRect(x + (cell - side) / 2, y + (cell - side) / 2, side, side);
    return;
  }
  if (shape === "lines") {
    const thickness = level * cell;
    if (thickness >= MIN_MARK) context.fillRect(x, y + (cell - thickness) / 2, cell, thickness);
    return;
  }
  const radius = (cell / 2) * Math.sqrt(level);
  if (radius < MIN_MARK) return;
  context.beginPath();
  context.arc(x + cell / 2, y + cell / 2, radius, 0, FULL_TURN);
  context.fill();
};

const applyHalftone = ({ frame, values }: EffectInput): void => {
  const cell = Math.max(1, Math.round(numberParam(values, "size")));
  const shape = textParam(values, "shape");
  const mono = textParam(values, "colour") === "mono";
  const data = frame.readPixels();
  const layer = new OffscreenCanvas(frame.width, frame.height);
  const context = layer.getContext("2d");
  if (!context) return;
  context.fillStyle = "#000000";
  context.fillRect(0, 0, frame.width, frame.height);
  for (let top = 0; top < frame.height; top += cell) {
    for (let left = 0; left < frame.width; left += cell) {
      const [red, green, blue] = cellAverage(data, frame.width, left, top, Math.min(frame.width, left + cell), Math.min(frame.height, top + cell));
      const level = (LUMA_R * red + LUMA_G * green + LUMA_B * blue) / CHANNEL_MAX;
      const grey = Math.round(level * CHANNEL_MAX);
      context.fillStyle = mono ? `rgb(${grey},${grey},${grey})` : `rgb(${Math.round(red)},${Math.round(green)},${Math.round(blue)})`;
      drawMark(context, shape, left, top, cell, level);
    }
  }
  const target = frame.context;
  target.globalAlpha = HALFTONE_OVER;
  target.drawImage(layer, 0, 0);
  target.globalAlpha = 1;
};

export const HALFTONE_POST_EFFECT: EffectDefinition = {
  key: "halftone",
  label: "Halftone",
  hint: "Print dots laid over the frame",
  params: [
    pixelParam("size", "Dot size", 2, 20, 4),
    { kind: "select", key: "shape", label: "Shape", options: [{ value: "dots", label: "Dots" }, { value: "squares", label: "Squares" }, { value: "lines", label: "Lines" }], default: "dots", advanced: true },
    { kind: "select", key: "colour", label: "Ink", options: [{ value: "source", label: "Photo colour" }, { value: "mono", label: "Mono" }], default: "source", advanced: true },
  ],
  apply: applyHalftone,
};
