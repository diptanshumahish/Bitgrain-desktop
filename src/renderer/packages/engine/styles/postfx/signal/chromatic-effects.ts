import { numberParam } from "../../engine/resolve-params";
import { percentParam, pixelParam, type EffectDefinition, type EffectInput } from "../effect-definition";
import { clampIndex, copyPixels } from "../pixel-ops";

const PERCENT = 100;
const DEGREES_TO_RADIANS = Math.PI / 180;
const CHANNELS = 4;
const RADIAL_GAIN = 2;

interface SplitVector {
  x: number;
  y: number;
}

type VectorAt = (x: number, y: number) => SplitVector;

const shiftChannels = (input: EffectInput, vectorAt: VectorAt): void => {
  const { width, height } = input.frame;
  const data = input.frame.pixels().data;
  const source = copyPixels(data);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const vector = vectorAt(x, y);
      const index = (y * width + x) * CHANNELS;
      const redIndex = (clampIndex(Math.round(y - vector.y), height) * width + clampIndex(Math.round(x - vector.x), width)) * CHANNELS;
      const blueIndex = (clampIndex(Math.round(y + vector.y), height) * width + clampIndex(Math.round(x + vector.x), width)) * CHANNELS;
      data[index] = source[redIndex];
      data[index + 2] = source[blueIndex + 2];
    }
  }
};

const radialVectors = (input: EffectInput, offset: number, radial: number): VectorAt => {
  const { width, height } = input.frame;
  const centreX = (numberParam(input.values, "x") / PERCENT) * width;
  const centreY = (numberParam(input.values, "y") / PERCENT) * height;
  const halfDiagonal = Math.hypot(width, height) / 2;
  return (x, y) => {
    const dx = x - centreX;
    const dy = y - centreY;
    const distance = Math.hypot(dx, dy) || 1;
    const magnitude = offset * (1 - radial + (distance / halfDiagonal) * RADIAL_GAIN * radial);
    return { x: (dx / distance) * magnitude, y: (dy / distance) * magnitude };
  };
};

const applyChromatic = (input: EffectInput): void => {
  const offset = Math.round(numberParam(input.values, "offset"));
  if (offset <= 0) return;
  const radial = numberParam(input.values, "radial") / PERCENT;
  if (radial > 0) return shiftChannels(input, radialVectors(input, offset, radial));
  const angle = numberParam(input.values, "angle") * DEGREES_TO_RADIANS;
  const vector = { x: Math.cos(angle) * offset, y: Math.sin(angle) * offset };
  shiftChannels(input, () => vector);
};

export const CHROMATIC_EFFECT: EffectDefinition = {
  key: "chromatic",
  label: "Chromatic",
  hint: "Red and blue drift apart like a cheap lens",
  params: [
    pixelParam("offset", "Offset", 1, 40, 3),
    { kind: "number", key: "angle", label: "Angle", min: 0, max: 360, step: 1, default: 0, suffix: "°", advanced: true },
    percentParam("radial", "From centre", 0, true),
    percentParam("x", "Centre across", 50, true),
    percentParam("y", "Centre down", 50, true),
  ],
  apply: applyChromatic,
};

export const RGB_SPLIT_EFFECT: EffectDefinition = {
  key: "rgbSplit",
  label: "RGB split",
  hint: "A hard sideways colour shift",
  params: [pixelParam("offset", "Offset", 1, 20, 2)],
  apply: (input) => {
    const offset = Math.round(numberParam(input.values, "offset"));
    if (offset > 0) shiftChannels(input, () => ({ x: offset, y: 0 }));
  },
};
