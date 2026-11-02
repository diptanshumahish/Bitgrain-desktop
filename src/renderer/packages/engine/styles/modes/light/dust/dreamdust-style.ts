import { Frame, frameFromPixels } from "../../../engine/frame";
import type { FrameRenderInput, FrameStyleDefinition } from "../../../engine/style-definition";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { drawSoftCopy, softCopy, type SoftCopy } from "../../../finish/soft-copy";
import { sampleInto } from "../shared/bilinear-sampler";
import { RGB, toFloatImage } from "../shared/float-image";
import { advancedRange, rangeParam } from "../shared/light-params";
import { PERCENT } from "../shared/light-maths";
import { dustColourLayer } from "./dust-colour";
import { buildDustField } from "./dust-field";
import { DEFAULT_DUST_COLOURS, dustColourOptions, dustPalette, dustRamp } from "./dust-palettes";
import { splatDust, type SplatPlane, type SplatSettings } from "./dust-splats";

const MIN_SPACING = 3;
const SPACING_BASE = 14;
const SPACING_GAIN = 10;
const MAX_DOTS = 120000;
const THRESHOLD_GAIN = 0.9;
const SOFT_BASE = 0.5;
const SOFT_GAIN = 1.6;
const PUSH_BASE = 2;
const PUSH_GAIN = 22;
const FIELD_BLUR_SHARE = 1 / 3;
const COLOUR_BLUR_MIN = 6;
const COLOUR_BLUR_SHARE = 3;
const GLOW_BLUR_BASE = 1.5;
const GLOW_BLUR_GAIN = 6;
const GLOW_ALPHA_BASE = 0.35;
const GLOW_ALPHA_GAIN = 0.6;
const TONE_CONTRAST = 20;
const BYTE = 255;
const RGBA = 4;

const splatSettingsFor = (params: FrameRenderInput["params"], width: number, height: number, scale: number): SplatSettings => {
  const density = numberParam(params, "density") / PERCENT;
  const spacing = Math.max(MIN_SPACING, (SPACING_BASE - SPACING_GAIN * density) * scale);
  return {
    spacing, density,
    count: Math.min(MAX_DOTS, Math.floor((width * height) / (spacing * spacing))),
    threshold: (THRESHOLD_GAIN * numberParam(params, "threshold")) / PERCENT,
    push: spacing * (PUSH_BASE + (PUSH_GAIN * numberParam(params, "drift")) / PERCENT),
    swirl: numberParam(params, "swirl") / PERCENT,
    baseRadius: spacing * (SOFT_BASE + (SOFT_GAIN * numberParam(params, "softness")) / PERCENT),
    sparkle: numberParam(params, "sparkle") / PERCENT,
    gradientStep: Math.max(1, Math.round(spacing / 2)),
  };
};

const colourImage = (copy: SoftCopy): ReturnType<typeof toFloatImage> => {
  const context = copy.canvas.getContext("2d");
  if (!context) throw new Error("2D canvas is not available");
  return toFloatImage({ data: context.getImageData(0, 0, copy.width, copy.height).data, width: copy.width, height: copy.height });
};

const tintedSplats = (plane: SplatPlane, copy: SoftCopy): Frame => {
  const colour = colourImage(copy);
  const ratioX = colour.width / plane.width;
  const ratioY = colour.height / plane.height;
  const pixels = new Uint8ClampedArray(plane.values.length * RGBA);
  const tint = new Float32Array(RGB);
  for (let y = 0; y < plane.height; y++) {
    for (let x = 0; x < plane.width; x++) {
      const pixel = y * plane.width + x;
      const light = Math.min(1, plane.values[pixel]) * BYTE;
      sampleInto(colour, (x + 0.5) * ratioX, (y + 0.5) * ratioY, tint);
      for (let channel = 0; channel < RGB; channel++) pixels[pixel * RGBA + channel] = light * tint[channel];
      pixels[pixel * RGBA + 3] = BYTE;
    }
  }
  return frameFromPixels(pixels, plane.width, plane.height);
};

const splatLayer = (input: FrameRenderInput, settings: SplatSettings): Frame => {
  const toned = toneAdjustedSource(input.source, input.params);
  const field = buildDustField(toFloatImage(toned), Math.round(settings.spacing * FIELD_BLUR_SHARE));
  const colours = textParam(input.params, "colours");
  const tonedFrame = frameFromPixels(toned.data, toned.width, toned.height);
  const colour = dustColourLayer(
    tonedFrame.canvas, Math.max(COLOUR_BLUR_MIN, COLOUR_BLUR_SHARE * settings.spacing), field.stretch,
    dustRamp(dustPalette(colours)), colours === "mono",
  );
  return tintedSplats(splatDust(field, settings), colour);
};

const renderDreamdust = (input: FrameRenderInput): void => {
  const { frame, params, scale } = input;
  const settings = splatSettingsFor(params, frame.width, frame.height, scale);
  const layer = splatLayer(input, settings);
  const glow = numberParam(params, "glow") / PERCENT;
  const context = frame.context;
  context.fillStyle = dustPalette(textParam(params, "colours")).background;
  context.fillRect(0, 0, frame.width, frame.height);
  context.globalCompositeOperation = "lighter";
  context.drawImage(layer.canvas, 0, 0);
  if (glow > 0) {
    context.globalAlpha = Math.min(1, GLOW_ALPHA_BASE + GLOW_ALPHA_GAIN * glow);
    drawSoftCopy(context, softCopy(layer.canvas, layer.width, layer.height, settings.spacing * (GLOW_BLUR_BASE + GLOW_BLUR_GAIN * glow)), frame.width, frame.height);
    context.globalAlpha = 1;
  }
  context.globalCompositeOperation = "source-over";
};

export const DREAMDUST_STYLE: FrameStyleDefinition = {
  id: "dreamdust",
  label: "Dreamdust",
  hint: "The light in the photo turns into drifting glowing dust",
  glyph: "✧·",
  category: "light",
  kind: "frame",
  params: [
    { kind: "select", key: "colours", label: "Colours", options: dustColourOptions(), default: DEFAULT_DUST_COLOURS },
    rangeParam("density", "Density", 100),
    rangeParam("glow", "Glow", 72),
    advancedRange("threshold", "Starts at", 15, { hint: "Darker parts than this stay empty" }),
    advancedRange("softness", "Softness", 66),
    advancedRange("sparkle", "Sparkle", 40),
    advancedRange("drift", "Drift", 14),
    advancedRange("swirl", "Swirl", 22),
    ...frameToneParams(TONE_CONTRAST),
  ],
  renderFrame: renderDreamdust,
};
