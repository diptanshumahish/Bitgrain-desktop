import type { FrameRenderInput, FrameStyleDefinition } from "../../../engine/style-definition";
import { numberParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { sampleInto } from "../shared/bilinear-sampler";
import { RGB, toFloatImage, writeFloatRgb, type FloatImage } from "../shared/float-image";
import { advancedRange, rangeParam } from "../shared/light-params";
import { clamp01, PERCENT } from "../shared/light-maths";
import { workingImage } from "../shared/working-image";
import { marchWind, type WindLayers } from "./light-wind-march";

const WORKING_EDGE = 380;
const REACH_GAIN = 1.1;
const GLOW_GAIN = 2;
const DEGREES = 180;
const TONE_CONTRAST = 20;

const compositeWind = (sharp: FloatImage, layers: WindLayers): Float32Array => {
  const out = new Float32Array(sharp.data.length);
  const ratio = layers.smear.width / sharp.width;
  const smear = new Float32Array(RGB);
  const glow = new Float32Array(RGB);
  for (let y = 0; y < sharp.height; y++) {
    for (let x = 0; x < sharp.width; x++) {
      const index = (y * sharp.width + x) * RGB;
      sampleInto(layers.smear, (x + 0.5) * ratio, (y + 0.5) * ratio, smear);
      sampleInto(layers.glow, (x + 0.5) * ratio, (y + 0.5) * ratio, glow);
      for (let channel = 0; channel < RGB; channel++) {
        const extended = Math.max(sharp.data[index + channel], smear[channel]);
        out[index + channel] = 1 - (1 - extended) * (1 - clamp01(glow[channel]));
      }
    }
  }
  return out;
};

const renderLightWind = ({ frame, source, params }: FrameRenderInput): void => {
  const toned = toneAdjustedSource(source, params);
  const angle = (numberParam(params, "direction") * Math.PI) / DEGREES;
  const layers = marchWind(workingImage(toned, WORKING_EDGE), {
    directionX: Math.cos(angle),
    directionY: Math.sin(angle),
    reach: (REACH_GAIN * numberParam(params, "length")) / PERCENT,
    threshold: numberParam(params, "threshold") / PERCENT,
    decay: numberParam(params, "decay") / PERCENT,
    wave: numberParam(params, "wave") / PERCENT,
    glow: (GLOW_GAIN * numberParam(params, "glow")) / PERCENT,
  });
  writeFloatRgb(frame, compositeWind(toFloatImage(toned), layers));
};

export const LIGHT_WIND_STYLE: FrameStyleDefinition = {
  id: "lightwind",
  label: "Light wind",
  hint: "Bright parts blow away in long glowing trails",
  glyph: "≋",
  category: "light",
  kind: "frame",
  params: [
    rangeParam("length", "Trail length", 70),
    rangeParam("direction", "Direction", 0, { max: 360, suffix: "°" }),
    rangeParam("glow", "Glow", 55),
    advancedRange("threshold", "Brightness cutoff", 40, { hint: "Only light above this level trails" }),
    advancedRange("decay", "Trail fade", 35),
    advancedRange("wave", "Waviness", 25),
    ...frameToneParams(TONE_CONTRAST),
  ],
  renderFrame: renderLightWind,
};
