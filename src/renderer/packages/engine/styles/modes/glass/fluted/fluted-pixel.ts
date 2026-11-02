import type { SourceImage } from "../../../engine/style-definition";
import { hash01 } from "../shared/glass-hash";
import { smoothRange } from "../shared/glass-math";
import { bilinearChannel } from "../shared/sampler";
import { snellOffset, type GridCurve, type SlopeProfile } from "./fluted-profiles";

const CHANNEL_MAX = 255;
const SHADOW_POWER = 1.6;
const SHADOW_GAIN = 0.9;
const HALF = 0.5;
const GRAIN_SALT = 59;

export interface FlutedSettings {
  source: SourceImage;
  stripe: number;
  cosine: number;
  sine: number;
  thickness: number;
  inverseIndex: number;
  shift: number;
  shadows: number;
  highlights: number;
  highlightWidth: number;
  grain: number;
  grainCell: number;
  slope: SlopeProfile;
  curve: GridCurve;
}

const sampleAt = (settings: FlutedSettings, across: number, along: number, out: Uint8ClampedArray, index: number, light: number): void => {
  const { source, cosine, sine } = settings;
  const x = across * cosine - along * sine;
  const y = across * sine + along * cosine;
  for (let channel = 0; channel < 3; channel++) {
    out[index + channel] = bilinearChannel(source, x, y, channel) * light;
  }
};

export const shadeFlutedPixel = (settings: FlutedSettings, x: number, y: number, out: Uint8ClampedArray, index: number): void => {
  const { stripe, cosine, sine } = settings;
  const across = x * cosine + y * sine;
  const along = -x * sine + y * cosine;
  const stripeCoord = across / stripe + settings.curve(across / stripe, along / stripe);
  const position = stripeCoord - Math.floor(stripeCoord);
  const offset = snellOffset(settings.slope(position), settings.inverseIndex, settings.thickness) + settings.shift;
  const darken = 1 - SHADOW_GAIN * settings.shadows * position ** SHADOW_POWER;
  const seamDistance = Math.min(position, 1 - position) * stripe;
  const glow = settings.highlights * (1 - smoothRange(0, settings.highlightWidth, seamDistance)) * CHANNEL_MAX;
  const sparkle = settings.grain ? (hash01(Math.floor(x / settings.grainCell), Math.floor(y / settings.grainCell), GRAIN_SALT) - HALF) * settings.grain : 0;
  sampleAt(settings, across + offset * stripe, along, out, index, darken);
  for (let channel = 0; channel < 3; channel++) out[index + channel] += glow + sparkle;
};
