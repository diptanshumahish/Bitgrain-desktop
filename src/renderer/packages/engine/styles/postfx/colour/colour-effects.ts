import { numberParam, textParam } from "../../engine/resolve-params";
import { percentParam, type EffectDefinition, type EffectPreset } from "../effect-definition";

const PERCENT = 100;
const LUMA_709_R = 0.2126;
const LUMA_709_G = 0.7152;
const LUMA_709_B = 0.0722;
const CHANNELS = 4;

const BLEND_OPTIONS = [
  { value: "soft-light", label: "Soft light" },
  { value: "overlay", label: "Overlay" },
  { value: "screen", label: "Screen" },
  { value: "multiply", label: "Multiply" },
  { value: "color", label: "Colour" },
  { value: "hue", label: "Hue" },
  { value: "saturation", label: "Saturation" },
  { value: "luminosity", label: "Luminosity" },
  { value: "hard-light", label: "Hard light" },
  { value: "color-burn", label: "Burn" },
  { value: "color-dodge", label: "Dodge" },
] as const;

const tintPreset = (name: string, colour: string, amount: number, blend: string): EffectPreset =>
  ({ name, values: { colour, amount, blend } });

const TINT_PRESETS: readonly EffectPreset[] = [
  tintPreset("Warm", "#ff8a3c", 32, "soft-light"),
  tintPreset("Cool", "#3ca6ff", 32, "soft-light"),
  tintPreset("Sepia", "#d8a86a", 58, "multiply"),
  tintPreset("Vintage", "#d8b46a", 38, "soft-light"),
  tintPreset("Fade", "#9aa0b0", 22, "screen"),
  tintPreset("Cyber", "#00e5ff", 40, "overlay"),
  tintPreset("Warming", "#ec8a00", 30, "soft-light"),
  tintPreset("Cooling", "#006dff", 30, "soft-light"),
  tintPreset("Deep red", "#cc0000", 35, "soft-light"),
  tintPreset("Emerald", "#00966b", 35, "soft-light"),
  tintPreset("Underwater", "#00c1b1", 35, "soft-light"),
  tintPreset("Violet", "#9c00ff", 25, "soft-light"),
];

export const TINT_EFFECT: EffectDefinition = {
  key: "tint",
  label: "Tint",
  hint: "Wash the whole frame in one colour",
  presets: TINT_PRESETS,
  params: [
    { kind: "colour", key: "colour", label: "Colour", default: "#ff8a3c" },
    percentParam("amount", "Amount", 32),
    { kind: "select", key: "blend", label: "Blend", options: BLEND_OPTIONS, default: "soft-light", advanced: true },
  ],
  apply: ({ frame, values }) => {
    const amount = numberParam(values, "amount") / PERCENT;
    if (amount <= 0) return;
    const context = frame.context;
    context.globalCompositeOperation = textParam(values, "blend") as GlobalCompositeOperation;
    context.globalAlpha = amount;
    context.fillStyle = textParam(values, "colour");
    context.fillRect(0, 0, frame.width, frame.height);
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  },
};

export const MONO_EFFECT: EffectDefinition = {
  key: "mono",
  label: "Black and white",
  hint: "Drain the colour",
  params: [percentParam("amount", "Amount", 100)],
  apply: ({ frame, values }) => {
    const amount = numberParam(values, "amount") / PERCENT;
    const data = frame.pixels().data;
    for (let index = 0; index < data.length; index += CHANNELS) {
      const luma = LUMA_709_R * data[index] + LUMA_709_G * data[index + 1] + LUMA_709_B * data[index + 2];
      data[index] += (luma - data[index]) * amount;
      data[index + 1] += (luma - data[index + 1]) * amount;
      data[index + 2] += (luma - data[index + 2]) * amount;
    }
  },
};
