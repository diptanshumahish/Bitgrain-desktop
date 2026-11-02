import type { FrameRenderInput } from "../../../engine/style-definition";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { toneAdjustedSource } from "../../../finish/frame-tone";
import { buildLedField, fieldColour, type LedField } from "./led-field";
import { hexToRgbTriple, smoothstep, type RgbTriple } from "../../../postfx/pixel-ops";
import { LED_KEYS, LED_SOURCE_MODE, type LedType } from "./led-params";

const PERCENT = 100;
const CHANNEL_MAX = 255;
const MIN_PITCH = 4;
const PITCH_STRETCH = 1.4;
const MIN_STEP = 3;
const WIDTH_REFERENCE = 900;
const STEP_BASE = 4;
const STEP_GAIN = 24;
const CHROMA_BOOST = 1.25;
const SOURCE_FADE_KNEE = 0.9;
const SOURCE_FADE_FLOOR = 0.5;
const MIN_LUMA = 1;
const LUMA_R = 0.299;
const LUMA_G = 0.587;
const LUMA_B = 0.114;

export interface LedPass {
  context: OffscreenCanvasRenderingContext2D;
  field: LedField;
  type: LedType;
  pitch: number;
  half: number;
  columns: number;
  rows: number;
  glow: number;
  gain: number;
  colour: RgbTriple;
  fromSource: boolean;
}

interface LedSample {
  intensity: number;
  colour: RgbTriple;
  raw: RgbTriple;
}

const pitchFor = (width: number, size: number): number =>
  Math.max(MIN_PITCH, PITCH_STRETCH * Math.max(MIN_STEP, Math.round((width / WIDTH_REFERENCE) * (STEP_BASE + (size / PERCENT) * STEP_GAIN))));

export const buildLedPass = ({ frame, source, params }: FrameRenderInput): LedPass => {
  const pitch = pitchFor(frame.width, numberParam(params, LED_KEYS.size));
  const type = textParam(params, LED_KEYS.type) as LedType;
  const shape = { pitch, columns: Math.ceil(frame.width / pitch), rows: Math.ceil(frame.height / pitch) };
  return {
    context: frame.context,
    field: buildLedField(toneAdjustedSource(source, params), shape),
    type,
    half: pitch / 2,
    ...shape,
    glow: numberParam(params, LED_KEYS.glow) / PERCENT,
    gain: numberParam(params, LED_KEYS.brightness) / PERCENT,
    colour: hexToRgbTriple(textParam(params, LED_KEYS.colour)),
    fromSource: type === "stripe" || textParam(params, LED_KEYS.colourMode) === LED_SOURCE_MODE,
  };
};

const boostedSourceColour = (raw: RgbTriple, luma: number): RgbTriple => {
  const fade = SOURCE_FADE_FLOOR + SOURCE_FADE_FLOOR * smoothstep(luma / CHANNEL_MAX / SOURCE_FADE_KNEE);
  const boost = (channel: number): number => Math.min(CHANNEL_MAX, Math.max(0, luma + (channel - luma) * CHROMA_BOOST)) * fade;
  return [boost(raw[0]), boost(raw[1]), boost(raw[2])];
};

const relit = (colour: RgbTriple, luma: number): RgbTriple => {
  const gain = luma / Math.max(MIN_LUMA, LUMA_R * colour[0] + LUMA_G * colour[1] + LUMA_B * colour[2]);
  return [Math.min(CHANNEL_MAX, colour[0] * gain), Math.min(CHANNEL_MAX, colour[1] * gain), Math.min(CHANNEL_MAX, colour[2] * gain)];
};

export const sampleLed = (pass: LedPass, column: number, row: number): LedSample => {
  const cell = row * pass.columns + column;
  const intensity = pass.field.intensity[cell];
  const luma = intensity * CHANNEL_MAX;
  const raw = relit(fieldColour(pass.field, cell), luma);
  return {
    intensity,
    colour: pass.fromSource ? boostedSourceColour(raw, luma) : pass.colour,
    raw,
  };
};
