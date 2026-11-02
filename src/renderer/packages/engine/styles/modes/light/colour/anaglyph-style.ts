import type { FrameRenderInput, FrameStyleDefinition } from "../../../engine/style-definition";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { frameToneParams } from "../../../finish/frame-tone";
import { lumaPlane, RGB, tonedImage, writeFloatRgb, type FloatImage } from "../shared/float-image";
import { advancedRange, optionsOf, rangeParam } from "../shared/light-params";
import { boxBlurPlane } from "../shared/plane-blur";
import { PERCENT } from "../shared/light-maths";

const MAX_SHIFT = 32;
const BLUR_BASE = 1;
const BLUR_GAIN = 15;
const BLUR_PASSES = 2;
const FAR_HUE = 4;
const HUE_SECTORS = 6;
const VALUE_BASE = 0.35;
const VALUE_GAIN = 0.65;
const CHROMA_SHARE = 0.85;
const TONE_CONTRAST = 20;
const HSV_RED = 5;
const HSV_GREEN = 3;
const HSV_BLUE = 1;
const HSV_PLATEAU = 4;

const SCHEMES = { redcyan: "Red and cyan", greenmagenta: "Green and magenta", chromadepth: "ChromaDepth" };

interface DepthView {
  image: FloatImage;
  depth: Float32Array;
  luma: Float32Array;
  maxShift: number;
  focus: number;
}

const hsvChannel = (hue: number, value: number, chroma: number, channelOffset: number): number => {
  const sector = (channelOffset + hue) % HUE_SECTORS;
  return value - chroma * Math.max(0, Math.min(sector, HSV_PLATEAU - sector, 1));
};

const paintChromaDepth = (view: DepthView, out: Float32Array): void => {
  for (let pixel = 0; pixel < view.depth.length; pixel++) {
    const hue = (1 - view.depth[pixel]) * FAR_HUE;
    const value = VALUE_BASE + VALUE_GAIN * view.luma[pixel];
    const chroma = CHROMA_SHARE * value;
    out[pixel * RGB] = hsvChannel(hue, value, chroma, HSV_RED);
    out[pixel * RGB + 1] = hsvChannel(hue, value, chroma, HSV_GREEN);
    out[pixel * RGB + 2] = hsvChannel(hue, value, chroma, HSV_BLUE);
  }
};

const paintStereo = (view: DepthView, out: Float32Array, leadChannel: number): void => {
  const { width, height, data } = view.image;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x;
      const shift = Math.round(view.maxShift * (view.depth[pixel] - view.focus));
      const lead = (y * width + Math.min(width - 1, Math.max(0, x + shift))) * RGB;
      const trail = (y * width + Math.min(width - 1, Math.max(0, x - shift))) * RGB;
      for (let channel = 0; channel < RGB; channel++) out[pixel * RGB + channel] = data[(channel === leadChannel ? lead : trail) + channel];
    }
  }
};

const renderAnaglyph = ({ frame, source, params, scale }: FrameRenderInput): void => {
  const image = tonedImage(source, params);
  const luma = lumaPlane(image);
  const blurRadius = (BLUR_BASE + (BLUR_GAIN * numberParam(params, "depthBlur")) / PERCENT) * scale;
  const view: DepthView = {
    image, luma,
    depth: boxBlurPlane(luma, image.width, image.height, blurRadius, BLUR_PASSES),
    maxShift: (MAX_SHIFT * numberParam(params, "disparity") * scale) / PERCENT,
    focus: numberParam(params, "focus") / PERCENT,
  };
  const out = new Float32Array(image.data.length);
  const scheme = textParam(params, "scheme");
  if (scheme === "chromadepth") paintChromaDepth(view, out);
  else paintStereo(view, out, scheme === "greenmagenta" ? 1 : 0);
  writeFloatRgb(frame, out);
};

export const ANAGLYPH_STYLE: FrameStyleDefinition = {
  id: "anaglyph",
  label: "Anaglyph 3D",
  hint: "Old school 3D glasses, bright parts pop forward",
  glyph: "◐◑",
  category: "light",
  kind: "frame",
  params: [
    { kind: "select", key: "scheme", label: "Glasses", options: optionsOf(SCHEMES), default: "redcyan" },
    rangeParam("disparity", "Depth", 40, { hint: "How far the colours pull apart" }),
    rangeParam("focus", "Focus", 50, { hint: "Which depth stays lined up" }),
    advancedRange("depthBlur", "Depth softness", 60),
    ...frameToneParams(TONE_CONTRAST),
  ],
  renderFrame: renderAnaglyph,
};
