import { numberParam } from "../../engine/resolve-params";
import { percentParam, type EffectDefinition, type EffectInput } from "../effect-definition";

const PERCENT = 100;
const GRAIN_RANGE = 60;
const CHANNELS = 4;
const CHANNEL_MAX = 255;

const applyFilmGrain = ({ frame, values, random }: EffectInput): void => {
  const amplitude = (GRAIN_RANGE * numberParam(values, "amount")) / PERCENT;
  if (amplitude <= 0) return;
  const colour = numberParam(values, "colour") / PERCENT;
  const data = frame.pixels().data;
  for (let index = 0; index < data.length; index += CHANNELS) {
    const shared = (random() - 0.5) * amplitude;
    for (let channel = 0; channel < 3; channel++) {
      const own = colour > 0 ? (random() - 0.5) * amplitude * colour : 0;
      data[index + channel] += shared * (1 - colour) + own;
    }
  }
};

export const FILM_GRAIN_EFFECT: EffectDefinition = {
  key: "filmGrain",
  label: "Film grain",
  hint: "Fine photographic grain",
  params: [percentParam("amount", "Amount", 30), percentParam("colour", "Colour grain", 0, true)],
  apply: applyFilmGrain,
};

const noiseTexture = (input: EffectInput, columns: number, rows: number): OffscreenCanvas => {
  const canvas = new OffscreenCanvas(columns, rows);
  const context = canvas.getContext("2d");
  if (!context) return canvas;
  const image = context.createImageData(columns, rows);
  const colour = numberParam(input.values, "colour") / PERCENT;
  for (let index = 0; index < image.data.length; index += CHANNELS) {
    const mono = CHANNEL_MAX * input.random();
    for (let channel = 0; channel < 3; channel++) image.data[index + channel] = mono + (CHANNEL_MAX * input.random() - mono) * colour;
    image.data[index + 3] = CHANNEL_MAX;
  }
  context.putImageData(image, 0, 0);
  return canvas;
};

const applyNoise = (input: EffectInput): void => {
  const amount = numberParam(input.values, "amount") / PERCENT;
  if (amount <= 0) return;
  const grain = Math.max(1, Math.round(numberParam(input.values, "size")));
  const { frame } = input;
  const texture = noiseTexture(input, Math.ceil(frame.width / grain), Math.ceil(frame.height / grain));
  const context = frame.context;
  context.imageSmoothingEnabled = false;
  context.globalCompositeOperation = "overlay";
  context.globalAlpha = amount;
  context.drawImage(texture, 0, 0, texture.width * grain, texture.height * grain);
  context.globalAlpha = 1;
  context.globalCompositeOperation = "source-over";
  context.imageSmoothingEnabled = true;
};

export const NOISE_EFFECT: EffectDefinition = {
  key: "noise",
  label: "Noise",
  hint: "Chunky overlay noise",
  params: [
    percentParam("amount", "Amount", 40),
    { kind: "number", key: "size", label: "Grain size", min: 1, max: 10, step: 1, default: 2, suffix: "px", advanced: true, scalesWithExport: true },
    percentParam("colour", "Colour noise", 0, true),
  ],
  apply: applyNoise,
};
