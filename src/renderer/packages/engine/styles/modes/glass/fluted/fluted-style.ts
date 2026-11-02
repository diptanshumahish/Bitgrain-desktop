import type { FrameRenderInput, FrameStyleDefinition, SourceImage } from "../../../engine/style-definition";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { fastBlurPixels } from "../shared/fast-blur";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { opaqueBuffer } from "../shared/frame-output";
import { option, percentSpec, pixelSpec } from "../shared/glass-params";
import { GRID_CURVES, SLOPE_PROFILES } from "./fluted-profiles";
import { shadeFlutedPixel, type FlutedSettings } from "./fluted-pixel";

const PERCENT = 100;
const CHANNELS = 4;
const CHANNEL_MAX = 255;
const GLASS_INDEX = 1.5;
const THICKNESS_GAIN = 6;
const BLUR_GAIN = 0.8;
const HIGHLIGHT_WIDTH = 1.2;
const GRAIN_LEVELS = 0.3;
const DEGREES_TO_RADIANS = Math.PI / 180;

const blurredSource = (source: SourceImage, sigma: number): SourceImage => {
  if (sigma < 1) return source;
  const data = new Uint8ClampedArray(source.data);
  fastBlurPixels(data, source.width, source.height, sigma);
  return { data, width: source.width, height: source.height };
};

const flutedSettings = (input: FrameRenderInput, source: SourceImage): FlutedSettings => {
  const { params, scale } = input;
  const angle = numberParam(params, "angle") * DEGREES_TO_RADIANS;
  const stripe = Math.max(2, numberParam(params, "size"));
  return {
    source: blurredSource(source, (numberParam(params, "blur") / PERCENT) * stripe * BLUR_GAIN),
    stripe, cosine: Math.cos(angle), sine: Math.sin(angle),
    thickness: (numberParam(params, "distortion") / PERCENT) * THICKNESS_GAIN,
    inverseIndex: 1 / GLASS_INDEX,
    shift: numberParam(params, "shift") / PERCENT,
    shadows: numberParam(params, "shadows") / PERCENT,
    highlights: numberParam(params, "highlights") / PERCENT,
    highlightWidth: HIGHLIGHT_WIDTH * scale,
    grain: (numberParam(params, "grain") / PERCENT) * CHANNEL_MAX * GRAIN_LEVELS,
    grainCell: Math.max(1, scale),
    slope: SLOPE_PROFILES[textParam(params, "shape")] ?? SLOPE_PROFILES.round,
    curve: GRID_CURVES[textParam(params, "grid")] ?? GRID_CURVES.straight,
  };
};

const renderFluted = (input: FrameRenderInput): void => {
  const source = toneAdjustedSource(input.source, input.params);
  const settings = flutedSettings(input, source);
  const out = opaqueBuffer(source);
  for (let y = 0; y < source.height; y++) {
    for (let x = 0; x < source.width; x++) shadeFlutedPixel(settings, x, y, out, (y * source.width + x) * CHANNELS);
  }
  input.frame.writePixels(out);
};

export const FLUTED_GLASS_STYLE: FrameStyleDefinition = {
  id: "flutedglass",
  label: "Fluted glass",
  hint: "The photo read through a ribbed pane",
  glyph: "▥",
  category: "glass",
  kind: "frame",
  params: [
    {
      kind: "select", key: "shape", label: "Ribs", default: "round", hint: "The profile of each rib",
      options: [option("round", "Round"), option("prism", "Prism"), option("wave", "Wave"), option("pleat", "Pleat"), option("flat", "Soft")],
    },
    pixelSpec("size", "Size", [3, 120, 14], "Width of each rib"),
    percentSpec("distortion", "Distortion", 50, "How strongly the ribs bend the view"),
    {
      kind: "select", key: "grid", label: "Grid", default: "straight", advanced: true, hint: "How the ribs run across the pane",
      options: [option("straight", "Straight"), option("irregular", "Irregular"), option("wavy", "Wavy"), option("zigzag", "Zigzag")],
    },
    { kind: "number", key: "angle", label: "Angle", min: 0, max: 180, step: 1, default: 0, suffix: "°", advanced: true, hint: "Turn the ribs" },
    { kind: "number", key: "shift", label: "Shift", min: -100, max: 100, step: 1, default: 0, suffix: "%", advanced: true, hint: "Slide the view inside each rib" },
    percentSpec("shadows", "Shadows", 40, "Shade along one side of each rib", true),
    percentSpec("highlights", "Highlights", 10, "Bright line on each rib edge", true),
    percentSpec("blur", "Blur", 0, "Soften the view behind the glass", true),
    percentSpec("grain", "Grain", 0, "Fine texture on the glass", true),
    ...frameToneParams(),
  ],
  renderFrame: renderFluted,
};
