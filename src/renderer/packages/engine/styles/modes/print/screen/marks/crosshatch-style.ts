import type { FrameRenderInput, FrameStyleDefinition, SourceImage } from "../../../../engine/style-definition";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { hexToRgbTriple, type RgbTriple } from "../../../../postfx/pixel-ops";
import { boxBlurPlane } from "../shared/box-blur-plane";
import { opaqueBuffer, unitLumaBuffer } from "../shared/pixel-buffers";
import { autoLevelPlane } from "../shared/plane-levels";
import { lumaOfRgb } from "../shared/screen-math";
import { paintHatching } from "./crosshatch-ink";
import { HATCH_PALETTE_OPTIONS, hatchPaletteFor } from "./crosshatch-palettes";

const DARKNESS_CENTRE = 50;
const DARKNESS_RANGE = 0.3;
const WIDTH_SHARE = 0.2;
const MIN_HALF_WIDTH = 0.35;
const BLUR_SHARE = 0.3;
const MIDTONE_TARGET = 0.6;
const TONE_CONTRAST = 25;

const lumaOfTriple = (colour: RgbTriple): number => lumaOfRgb(colour[0], colour[1], colour[2]);

const darknessPlane = (source: SourceImage, spacing: number, lightInk: boolean, shift: number): Float32Array => {
  const blurred = boxBlurPlane(unitLumaBuffer(source), source.width, source.height, Math.round(spacing * BLUR_SHARE));
  const levelled = autoLevelPlane(blurred, MIDTONE_TARGET);
  for (let index = 0; index < levelled.length; index++) {
    levelled[index] = (lightInk ? levelled[index] : 1 - levelled[index]) + shift;
  }
  return levelled;
};

const renderCrosshatch = ({ frame, source, params, scale }: FrameRenderInput): void => {
  const palette = hatchPaletteFor(textParam(params, "palette"));
  const ink = hexToRgbTriple(palette.ink);
  const paper = hexToRgbTriple(palette.paper);
  const spacing = numberParam(params, "size");
  const shift = ((numberParam(params, "darkness") - DARKNESS_CENTRE) / DARKNESS_CENTRE) * DARKNESS_RANGE;
  const lightInk = lumaOfTriple(ink) > lumaOfTriple(paper);
  const data = opaqueBuffer(frame.width, frame.height);
  paintHatching({
    darkness: darknessPlane(toneAdjustedSource(source, params), spacing, lightInk, shift),
    width: frame.width,
    height: frame.height,
    spacing,
    halfWidth: Math.max(MIN_HALF_WIDTH * scale, spacing * WIDTH_SHARE * numberParam(params, "weight")),
    angle: numberParam(params, "angle"),
    ink,
    paper,
  }, data);
  frame.writePixels(data);
};

export const CROSSHATCH_STYLE: FrameStyleDefinition = {
  id: "crosshatch-style",
  label: "Crosshatch",
  hint: "Pen hatching that thickens in the shadows",
  glyph: "✕",
  category: "print",
  kind: "frame",
  params: [
    { kind: "number", key: "size", label: "Size", min: 4, max: 40, step: 1, default: 6, suffix: "px", scalesWithExport: true },
    { kind: "number", key: "darkness", label: "Darkness", min: 0, max: 100, step: 1, default: 62, suffix: "%" },
    { kind: "select", key: "palette", label: "Palette", options: HATCH_PALETTE_OPTIONS, default: "sepia" },
    { kind: "number", key: "weight", label: "Line weight", min: 0.5, max: 3, step: 0.1, default: 1, suffix: "x", advanced: true },
    { kind: "number", key: "angle", label: "Angle", min: -90, max: 90, step: 1, default: 0, suffix: "°", advanced: true },
    ...frameToneParams(TONE_CONTRAST),
  ],
  renderFrame: renderCrosshatch,
};
