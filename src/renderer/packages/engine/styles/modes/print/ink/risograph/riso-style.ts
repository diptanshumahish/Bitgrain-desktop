import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { CHANNELS, CHANNEL_MAX } from "../shared/float-field";
import { GLOW_PLATES, PAPER_PLATES, PRINT_OPTIONS, type PrintMode } from "./riso-plates";
import { createRisoScreen, risoPixel, type RisoScreen } from "./riso-screen";

const RISO_BRIGHTNESS = -12;
const KEYS = { size: "size", registration: "registration", print: "print", levels: "levels", angle: "angle", separation: "separation" } as const;

const PERCENT = 100;
const PITCH_RATIO = 0.8;
const MIN_PITCH = 3;
const REGISTRATION_CAP = 14;
const REGISTRATION_GAIN = 0.6;
const DENSITY = 100 / 85;

const screenFor = (input: FrameRenderInput): RisoScreen => {
  const { params, scale } = input;
  const pitch = Math.max(MIN_PITCH * scale, numberParam(params, KEYS.size) * PITCH_RATIO);
  const mode: PrintMode = textParam(params, KEYS.print) === "glow" ? "glow" : "paper";
  return createRisoScreen({
    source: toneAdjustedSource(input.source, params),
    mode,
    plates: mode === "glow" ? GLOW_PLATES : PAPER_PLATES,
    pitch,
    registration: (numberParam(params, KEYS.registration) / PERCENT) * Math.min(pitch, REGISTRATION_CAP * scale) * REGISTRATION_GAIN,
    levels: Math.round(numberParam(params, KEYS.levels)),
    angleDegrees: numberParam(params, KEYS.angle),
    separation: numberParam(params, KEYS.separation) / PERCENT,
    density: DENSITY,
  });
};

const renderRiso = (input: FrameRenderInput): void => {
  const { frame } = input;
  const screen = screenFor(input);
  const data = frame.pixels().data;
  const colour = new Float32Array(3);
  for (let y = 0; y < frame.height; y++) {
    for (let x = 0; x < frame.width; x++) {
      risoPixel(screen, x, y, colour);
      const offset = (y * frame.width + x) * CHANNELS;
      data[offset] = colour[0] * CHANNEL_MAX;
      data[offset + 1] = colour[1] * CHANNEL_MAX;
      data[offset + 2] = colour[2] * CHANNEL_MAX;
      data[offset + 3] = CHANNEL_MAX;
    }
  }
  frame.commit();
};

export const RISOGRAPH_STYLE: FrameStyleDefinition = {
  id: "risograph",
  label: "Risograph",
  hint: "Three ink screens printed slightly out of register",
  glyph: "▚",
  category: "print",
  kind: "frame",
  params: [
    { kind: "number", key: KEYS.size, label: "Dot size", min: 3, max: 80, step: 1, default: 8, suffix: "px", scalesWithExport: true },
    { kind: "number", key: KEYS.registration, label: "Misregistration", min: 0, max: 100, step: 1, default: 35, suffix: "%" },
    { kind: "select", key: KEYS.print, label: "Print", options: PRINT_OPTIONS, default: "glow" },
    { kind: "number", key: KEYS.levels, label: "Ink levels", min: 2, max: 8, step: 1, default: 6, advanced: true },
    { kind: "number", key: KEYS.angle, label: "Screen angle", min: 0, max: 90, step: 1, default: 0, suffix: "°", advanced: true },
    { kind: "number", key: KEYS.separation, label: "Colour push", min: 0, max: 300, step: 1, default: 200, suffix: "%", advanced: true },
    ...frameToneParams(20, RISO_BRIGHTNESS),
  ],
  renderFrame: renderRiso,
};
