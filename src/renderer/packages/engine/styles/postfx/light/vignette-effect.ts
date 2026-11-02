import { numberParam, textParam } from "../../engine/resolve-params";
import { percentParam, type EffectDefinition, type EffectInput } from "../effect-definition";
import { hexToRgbTriple, smoothstep } from "../pixel-ops";

const PERCENT = 100;
const RADIUS_BASE = 0.28;
const RADIUS_GAIN = 0.72;
const FEATHER_BASE = 0.03;
const FEATHER_GAIN = 0.9;
const CHANNELS = 4;

interface VignetteShape {
  strength: number;
  aspectDivisor: number;
  rectangular: boolean;
  centreX: number;
  centreY: number;
  start: number;
  feather: number;
}

const shapeFor = ({ frame, values }: EffectInput): VignetteShape => {
  const roundness = numberParam(values, "roundness") / PERCENT;
  const aspect = frame.width / frame.height;
  const rectangular = textParam(values, "shape") === "rect";
  return {
    strength: numberParam(values, "amount") / PERCENT,
    aspectDivisor: rectangular ? aspect : (1 - roundness) * aspect + roundness,
    rectangular,
    centreX: numberParam(values, "x") / PERCENT,
    centreY: numberParam(values, "y") / PERCENT,
    start: RADIUS_BASE + (RADIUS_GAIN * numberParam(values, "size")) / PERCENT,
    feather: FEATHER_BASE + (FEATHER_GAIN * numberParam(values, "feather")) / PERCENT,
  };
};

const weightAt = (shape: VignetteShape, u: number, v: number): number => {
  const dx = (u - shape.centreX) / shape.aspectDivisor;
  const dy = v - shape.centreY;
  const distance = shape.rectangular ? Math.max(Math.abs(dx), Math.abs(dy)) : Math.hypot(dx, dy);
  return smoothstep((2 * distance - shape.start) / shape.feather) * shape.strength;
};

const applyVignette = (input: EffectInput): void => {
  const shape = shapeFor(input);
  if (shape.strength <= 0) return;
  const [red, green, blue] = hexToRgbTriple(textParam(input.values, "colour"));
  const { width, height } = input.frame;
  const data = input.frame.pixels().data;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const weight = weightAt(shape, (x + 0.5) / width, (y + 0.5) / height);
      if (weight <= 0) continue;
      const index = (y * width + x) * CHANNELS;
      data[index] += (red - data[index]) * weight;
      data[index + 1] += (green - data[index + 1]) * weight;
      data[index + 2] += (blue - data[index + 2]) * weight;
    }
  }
};

export const VIGNETTE_EFFECT: EffectDefinition = {
  key: "vignette",
  label: "Vignette",
  hint: "Darken toward the edges",
  params: [
    percentParam("amount", "Amount", 50),
    percentParam("size", "Size", 50, true),
    percentParam("feather", "Softness", 50, true),
    percentParam("roundness", "Roundness", 50, true),
    { kind: "select", key: "shape", label: "Shape", options: [{ value: "round", label: "Round" }, { value: "rect", label: "Square" }], default: "round", advanced: true },
    { kind: "colour", key: "colour", label: "Colour", default: "#000000", advanced: true },
    percentParam("x", "Centre across", 50, true),
    percentParam("y", "Centre down", 50, true),
  ],
  apply: applyVignette,
};
