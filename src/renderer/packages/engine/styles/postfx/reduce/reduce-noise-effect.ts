import { numberParam, textParam } from "../../engine/resolve-params";
import { percentParam, type EffectDefinition, type EffectInput } from "../effect-definition";
import { median3x3, median5x5, type Plane } from "./median-filter";

const PERCENT = 100;
const CHANNELS = 4;
const COLOUR_CHANNELS = 3;
const MIN_SIDE = 3;
const WIDE_RADIUS = "wide";

const extractPlane = (data: Uint8ClampedArray, channel: number, plane: Plane): void => {
  const { values } = plane;
  for (let pixel = 0; pixel < values.length; pixel++) values[pixel] = data[pixel * CHANNELS + channel];
};

const blendPlane = (data: Uint8ClampedArray, channel: number, median: Uint8Array, amount: number): void => {
  for (let pixel = 0; pixel < median.length; pixel++) {
    const index = pixel * CHANNELS + channel;
    data[index] += (median[pixel] - data[index]) * amount;
  }
};

const applyReduceNoise = ({ frame, values }: EffectInput): void => {
  const amount = Math.min(1, numberParam(values, "amount") / PERCENT);
  const { width, height } = frame;
  if (amount <= 0 || width < MIN_SIDE || height < MIN_SIDE) return;
  const filter = textParam(values, "radius") === WIDE_RADIUS ? median5x5 : median3x3;
  const data = frame.pixels().data;
  const plane: Plane = { values: new Uint8Array(width * height), width, height };
  const median = new Uint8Array(width * height);
  for (let channel = 0; channel < COLOUR_CHANNELS; channel++) {
    extractPlane(data, channel, plane);
    filter(plane, median);
    blendPlane(data, channel, median, amount);
  }
};

export const REDUCE_NOISE_EFFECT: EffectDefinition = {
  key: "reduceNoise",
  label: "Reduce noise",
  hint: "Smooth out speckles while keeping edges",
  params: [
    percentParam("amount", "Amount", 60),
    {
      kind: "select", key: "radius", label: "Reach",
      options: [{ value: "tight", label: "Tight" }, { value: WIDE_RADIUS, label: "Wide" }],
      default: "tight", advanced: true,
    },
  ],
  apply: applyReduceNoise,
};
