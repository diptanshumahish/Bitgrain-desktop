import { numberParam } from "../../engine/resolve-params";
import { percentParam, type EffectDefinition, type EffectInput } from "../effect-definition";
import { smoothstep } from "../pixel-ops";

const PERCENT = 100;
const CHANNEL_MAX = 255;
const HALF_RANGE = 128;
const MIN_BAND = 1;
const CHANNELS = 4;
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

const buildLookup = (cutoff: number, band: number): Uint8ClampedArray => {
  const lookup = new Uint8ClampedArray(CHANNEL_MAX + 1);
  for (let luma = 0; luma <= CHANNEL_MAX; luma++) {
    lookup[luma] = band < MIN_BAND
      ? (luma >= cutoff ? CHANNEL_MAX : 0)
      : CHANNEL_MAX * smoothstep((luma - (cutoff - band)) / (2 * band));
  }
  return lookup;
};

const applyThreshold = ({ frame, values }: EffectInput): void => {
  const cutoff = (numberParam(values, "cutoff") / PERCENT) * CHANNEL_MAX;
  const band = (numberParam(values, "smoothness") / PERCENT) * HALF_RANGE;
  const lookup = buildLookup(cutoff, band);
  const data = frame.pixels().data;
  for (let index = 0; index < data.length; index += CHANNELS) {
    const grey = lookup[Math.round(LUMA_R * data[index] + LUMA_G * data[index + 1] + LUMA_B * data[index + 2])];
    data[index] = grey;
    data[index + 1] = grey;
    data[index + 2] = grey;
  }
};

export const THRESHOLD_EFFECT: EffectDefinition = {
  key: "threshold",
  label: "Threshold",
  hint: "Turn the picture into pure black and white",
  params: [
    percentParam("cutoff", "Cutoff", 50),
    percentParam("smoothness", "Softness", 0),
  ],
  apply: applyThreshold,
};
