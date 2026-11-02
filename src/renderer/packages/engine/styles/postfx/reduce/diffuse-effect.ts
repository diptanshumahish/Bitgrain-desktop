import { numberParam, textParam } from "../../engine/resolve-params";
import { percentParam, type EffectDefinition, type EffectInput } from "../effect-definition";
import { copyPixels } from "../pixel-ops";

const PERCENT = 100;
const CHANNELS = 4;
const REACH_BASE = 1;
const REACH_GAIN = 7;
const HASH_A = 2654435761;
const HASH_B = 2246822507;
const HASH_C = 3266489909;
const SHIFT_WIDE = 16;
const SHIFT_NARROW = 13;
const UINT32_RANGE = 4294967296;
const FULL_TURN = Math.PI * 2;
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

type DiffuseMode = "normal" | "lighten" | "darken";

const avalanche = (value: number): number => {
  let mixed = Math.imul(value, HASH_A);
  mixed = Math.imul(mixed ^ (mixed >>> SHIFT_WIDE), HASH_B);
  mixed = Math.imul(mixed ^ (mixed >>> SHIFT_NARROW), HASH_C);
  return ((mixed ^ (mixed >>> SHIFT_WIDE)) >>> 0) / UINT32_RANGE;
};

const lumaAt = (data: Uint8ClampedArray, index: number): number =>
  LUMA_R * data[index] + LUMA_G * data[index + 1] + LUMA_B * data[index + 2];

const accepts = (mode: DiffuseMode, original: Uint8ClampedArray, current: number, scattered: number): boolean => {
  if (mode === "normal") return true;
  const delta = lumaAt(original, scattered) - lumaAt(original, current);
  return mode === "lighten" ? delta > 0 : delta < 0;
};

const scatteredIndex = (pixel: number, x: number, y: number, reach: number, size: [number, number]): number => {
  const angle = FULL_TURN * avalanche(pixel);
  const distance = avalanche(~pixel) * reach;
  const sourceX = Math.min(size[0] - 1, Math.max(0, Math.round(x + Math.cos(angle) * distance)));
  const sourceY = Math.min(size[1] - 1, Math.max(0, Math.round(y + Math.sin(angle) * distance)));
  return (sourceY * size[0] + sourceX) * CHANNELS;
};

const applyDiffuse = ({ frame, values, scale }: EffectInput): void => {
  const reach = (REACH_BASE + (numberParam(values, "amount") / PERCENT) * REACH_GAIN) * scale;
  const mode = textParam(values, "mode") as DiffuseMode;
  const size: [number, number] = [frame.width, frame.height];
  const data = frame.pixels().data;
  const original = copyPixels(data);
  for (let y = 0; y < frame.height; y++) {
    for (let x = 0; x < frame.width; x++) {
      const pixel = y * frame.width + x;
      const target = pixel * CHANNELS;
      const source = scatteredIndex(pixel, x, y, reach, size);
      if (!accepts(mode, original, target, source)) continue;
      data[target] = original[source];
      data[target + 1] = original[source + 1];
      data[target + 2] = original[source + 2];
      data[target + 3] = original[source + 3];
    }
  }
};

export const DIFFUSE_EFFECT: EffectDefinition = {
  key: "diffuse",
  label: "Diffuse",
  hint: "Scatter pixels for a frosted, sandy edge",
  params: [
    percentParam("amount", "Amount", 50),
    {
      kind: "select", key: "mode", label: "Mode",
      options: [
        { value: "normal", label: "Normal" },
        { value: "lighten", label: "Lighten only" },
        { value: "darken", label: "Darken only" },
      ],
      default: "normal", advanced: true,
    },
  ],
  apply: applyDiffuse,
};
