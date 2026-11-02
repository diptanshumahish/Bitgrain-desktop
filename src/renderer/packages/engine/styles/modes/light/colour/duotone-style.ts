import type { FrameRenderInput, FrameStyleDefinition } from "../../../engine/style-definition";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { hexToRgbTriple } from "../../../postfx/pixel-ops";
import { advancedRange, rangeParam } from "../shared/light-params";
import { clamp01, lumaOfRgb, PERCENT } from "../shared/light-maths";

const BYTE = 255;
const RGBA = 4;
const LUT_SIZE = 256;
const PIVOT_CENTRE = 0.5;

const DUOTONE_INKS = { shadow: "#1a1636", highlight: "#f5c542" };

const duotoneLut = (shadowHex: string, highlightHex: string, pivot: number, contrast: number): Uint8ClampedArray => {
  const shadow = hexToRgbTriple(shadowHex);
  const highlight = hexToRgbTriple(highlightHex);
  const lut = new Uint8ClampedArray(LUT_SIZE * 3);
  for (let level = 0; level < LUT_SIZE; level++) {
    const position = clamp01((level / BYTE - pivot) * contrast + PIVOT_CENTRE);
    for (let channel = 0; channel < 3; channel++) lut[level * 3 + channel] = shadow[channel] + (highlight[channel] - shadow[channel]) * position;
  }
  return lut;
};

const renderDuotone = ({ frame, source, params }: FrameRenderInput): void => {
  const toned = toneAdjustedSource(source, params);
  const lut = duotoneLut(
    textParam(params, "shadow"), textParam(params, "highlight"),
    numberParam(params, "midpoint") / PERCENT, numberParam(params, "inkContrast") / PERCENT,
  );
  const data = toned.data;
  const out = new Uint8ClampedArray(data.length);
  for (let index = 0; index < data.length; index += RGBA) {
    const level = Math.round(lumaOfRgb(data[index], data[index + 1], data[index + 2])) * 3;
    out[index] = lut[level];
    out[index + 1] = lut[level + 1];
    out[index + 2] = lut[level + 2];
    out[index + 3] = BYTE;
  }
  frame.writePixels(out);
};

export const DUOTONE_STYLE: FrameStyleDefinition = {
  id: "duotone-style",
  label: "Duotone",
  hint: "Two inks, shadows in one and light in the other",
  glyph: "◧",
  category: "light",
  kind: "frame",
  params: [
    { kind: "colour", key: "shadow", label: "Shadow ink", default: DUOTONE_INKS.shadow },
    { kind: "colour", key: "highlight", label: "Light ink", default: DUOTONE_INKS.highlight },
    rangeParam("midpoint", "Balance", 50, { hint: "Lower lets more of the light ink in" }),
    advancedRange("inkContrast", "Ink contrast", 100, { max: 200 }),
    ...frameToneParams(),
  ],
  renderFrame: renderDuotone,
};
