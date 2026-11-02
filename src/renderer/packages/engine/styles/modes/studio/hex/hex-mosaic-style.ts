import type { FrameRenderInput, FrameStyleDefinition, SourceImage } from "../../../engine/style-definition";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { hexToRgbTriple, type RgbTriple } from "../../../postfx/pixel-ops";
import { buildHexLayout, edgeDistance, locateHex, type HexHit, type HexLayout } from "./hex-geometry";

const PERCENT = 100;
const CHANNELS = 4;
const ALPHA_OPAQUE = 255;
const GROUT_MAX = 3;
const MIN_GROUT = 0.02;
const BEVEL_BAND = 0.2;
const BEVEL_DEPTH = 0.45;
const LIGHT_X = 0.55;
const LIGHT_Y = 0.83;
const KEYS = { size: "size", grout: "grout", groutColour: "groutColour", bevel: "bevel", orientation: "orientation" } as const;

interface HexPass {
  source: SourceImage;
  layout: HexLayout;
  halfGrout: number;
  grout: RgbTriple;
  bevel: number;
  hit: HexHit;
}

const sampleIndex = (source: SourceImage, x: number, y: number): number => {
  const column = Math.min(source.width - 1, Math.max(0, Math.round(x)));
  const row = Math.min(source.height - 1, Math.max(0, Math.round(y)));
  return (row * source.width + column) * CHANNELS;
};

const bevelShade = (pass: HexPass, edge: number): number => {
  if (pass.bevel <= 0 || edge > BEVEL_BAND * pass.layout.inradius) return 1;
  const facing = (pass.hit.offsetX * LIGHT_X + pass.hit.offsetY * LIGHT_Y) / pass.layout.size;
  return 1 - BEVEL_DEPTH * pass.bevel * facing;
};

const paintPixel = (pass: HexPass, data: Uint8ClampedArray, target: number): void => {
  const edge = edgeDistance(pass.layout, pass.hit);
  const from = sampleIndex(pass.source, pass.hit.centreX, pass.hit.centreY);
  const shade = bevelShade(pass, edge);
  const groutMix = pass.halfGrout > 0 ? Math.min(1, Math.max(0, pass.halfGrout - edge + 0.5)) : 0;
  for (let channel = 0; channel < 3; channel++) {
    const tile = pass.source.data[from + channel] * shade;
    data[target + channel] = tile + (pass.grout[channel] - tile) * groutMix;
  }
  data[target + 3] = ALPHA_OPAQUE;
};

const buildPass = ({ source, params, scale }: FrameRenderInput): HexPass => {
  const groutAmount = numberParam(params, KEYS.grout) / PERCENT;
  return {
    source: toneAdjustedSource(source, params),
    layout: buildHexLayout(Math.max(1, numberParam(params, KEYS.size)), textParam(params, KEYS.orientation) !== "flat"),
    halfGrout: groutAmount > MIN_GROUT ? (Math.max(1, Math.round(GROUT_MAX * groutAmount * scale)) / 2) : 0,
    grout: hexToRgbTriple(textParam(params, KEYS.groutColour)),
    bevel: numberParam(params, KEYS.bevel) / PERCENT,
    hit: { centreX: 0, centreY: 0, offsetX: 0, offsetY: 0 },
  };
};

const renderHexMosaic = (input: FrameRenderInput): void => {
  const pass = buildPass(input);
  const { frame } = input;
  const data = frame.pixels().data;
  for (let y = 0; y < frame.height; y++) {
    for (let x = 0; x < frame.width; x++) {
      locateHex(pass.layout, x + 0.5, y + 0.5, pass.hit);
      paintPixel(pass, data, (y * frame.width + x) * CHANNELS);
    }
  }
};

export const HEX_MOSAIC_STYLE: FrameStyleDefinition = {
  id: "hexmosaic",
  label: "Hex mosaic",
  hint: "The photo rebuilt from flat hexagon tiles",
  glyph: "⬢",
  category: "pixel",
  kind: "frame",
  params: [
    { kind: "number", key: KEYS.size, label: "Size", min: 4, max: 60, step: 1, default: 16, suffix: "px", scalesWithExport: true },
    { kind: "number", key: KEYS.grout, label: "Grout", min: 0, max: 100, step: 1, default: 15, suffix: "%", hint: "Lines between the tiles" },
    { kind: "number", key: KEYS.bevel, label: "Bevel", min: 0, max: 100, step: 1, default: 0, suffix: "%", hint: "Shade tile edges like pressed glass" },
    {
      kind: "select", key: KEYS.orientation, label: "Orientation", advanced: true, default: "pointy",
      options: [{ value: "pointy", label: "Pointy top" }, { value: "flat", label: "Flat top" }],
    },
    { kind: "colour", key: KEYS.groutColour, label: "Grout colour", default: "#000000", advanced: true },
    ...frameToneParams(),
  ],
  renderFrame: renderHexMosaic,
};
