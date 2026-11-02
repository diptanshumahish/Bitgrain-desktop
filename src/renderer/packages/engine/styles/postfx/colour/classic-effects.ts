import type { ImagePlugin, TransformContext } from "../../../core/types";
import { HazeBloomPlugin } from "../../../plugins/haze-bloom";
import { DuotonePlugin, PosterizePlugin } from "../../../plugins/grade";
import { numberParam, textParam } from "../../engine/resolve-params";
import { percentParam, type EffectDefinition, type EffectInput } from "../effect-definition";
import { hexToRgbTriple } from "../pixel-ops";

const PERCENT = 100;
const CHANNELS = 4;
const CHANNEL_MAX = 255;
const ALPHA_OFFSET = 3;

type ContextExtras = Partial<TransformContext>;

const runPlugin = (input: EffectInput, plugin: ImagePlugin, extras: ContextExtras): void => {
  const image = input.frame.pixels();
  const { width, height } = input.frame;
  const result = plugin.transform({
    data: Float32Array.from(image.data), width, height, contrast: 1, brightness: 1, saturation: 1, isColor: true, ...extras,
  });
  if (!result.colorData) return;
  for (let index = 0; index < image.data.length; index += CHANNELS) {
    image.data[index] = result.colorData[index];
    image.data[index + 1] = result.colorData[index + 1];
    image.data[index + 2] = result.colorData[index + 2];
  }
};

export const HAZE_EFFECT: EffectDefinition = {
  key: "haze",
  label: "Haze",
  hint: "Milky film haze with a soft glow",
  params: [
    percentParam("amount", "Haze", 30),
    percentParam("glow", "Glow", 40),
    percentParam("glowFrom", "Glow starts at", 70, true),
    percentParam("warmth", "Warmth", 50, true),
  ],
  apply: (input) => runPlugin(input, HazeBloomPlugin, {
    hazeIntensity: numberParam(input.values, "amount") / PERCENT,
    bloomIntensity: numberParam(input.values, "glow") / PERCENT,
    bloomThreshold: numberParam(input.values, "glowFrom") / PERCENT,
    hazeWarmth: numberParam(input.values, "warmth") / PERCENT,
  }),
};

export const DUOTONE_EFFECT: EffectDefinition = {
  key: "duotone",
  label: "Duotone",
  hint: "Map the frame to two inks",
  params: [
    { kind: "colour", key: "shadow", label: "Shadows", default: "#1b1f3b" },
    { kind: "colour", key: "highlight", label: "Lights", default: "#f2c14e" },
    percentParam("amount", "Amount", 100, true),
  ],
  apply: (input) => runPlugin(input, DuotonePlugin, {
    duotoneShadow: hexToRgbTriple(textParam(input.values, "shadow")),
    duotoneHighlight: hexToRgbTriple(textParam(input.values, "highlight")),
    duotoneAmount: numberParam(input.values, "amount") / PERCENT,
  }),
};

export const POSTERIZE_EFFECT: EffectDefinition = {
  key: "posterize",
  label: "Posterise",
  hint: "Fewer, flatter tones",
  params: [{ kind: "number", key: "levels", label: "Levels", min: 2, max: 16, step: 1, default: 6 }],
  apply: (input) => runPlugin(input, PosterizePlugin, { posterizeLevels: numberParam(input.values, "levels") }),
};

export const INVERT_EFFECT: EffectDefinition = {
  key: "invert",
  label: "Invert",
  hint: "A photographic negative",
  params: [percentParam("amount", "Amount", 100)],
  apply: ({ frame, values }) => {
    const amount = numberParam(values, "amount") / PERCENT;
    const data = frame.pixels().data;
    for (let index = 0; index < data.length; index++) {
      if (index % CHANNELS === ALPHA_OFFSET) continue;
      data[index] += (CHANNEL_MAX - 2 * data[index]) * amount;
    }
  },
};
