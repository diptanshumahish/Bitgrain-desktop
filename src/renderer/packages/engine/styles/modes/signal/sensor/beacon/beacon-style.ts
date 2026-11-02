import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import type { StyleLook } from "../../../../engine/style-types";
import { numberParam, textParam, toggleParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { bloom, combine, scanlines, tint, vignette } from "../../../../looks/look-builders";
import { PERCENT } from "../../shared/signal-math";
import { beaconCellSize, beaconGrid, uphillAngle } from "./beacon-grid";
import { drawBeaconGlow } from "./beacon-glow";
import { drawBeaconGlyphs } from "./beacon-glyphs";

const TAIL_MIN = 4;
const TAIL_RANGE = 40;
const GAIN_BASE = 0.5;
const GAIN_RANGE = 1.4;
const OPACITY_BASE = 0.2;
const OPACITY_RANGE = 1.6;
const DEGREES_TO_RADIANS = Math.PI / 180;

const unit = (params: FrameRenderInput["params"], key: string): number => numberParam(params, key) / PERCENT;

const renderBeacon = ({ frame, source, params }: FrameRenderInput): void => {
  const toned = toneAdjustedSource(source, params);
  const grid = beaconGrid(toned, beaconCellSize(toned.width, unit(params, "size")));
  const context = frame.context;
  context.fillStyle = "#000000";
  context.fillRect(0, 0, frame.width, frame.height);
  drawBeaconGlow(frame, grid, {
    angle: toggleParam(params, "auto") ? uphillAngle(grid) : numberParam(params, "angle") * DEGREES_TO_RADIANS,
    tail: Math.max(TAIL_MIN, Math.round(TAIL_RANGE * unit(params, "tail") + TAIL_MIN)),
    gain: GAIN_BASE + GAIN_RANGE * unit(params, "glow"),
    radius: unit(params, "radius"),
    opacity: OPACITY_BASE + OPACITY_RANGE * unit(params, "opacity"),
  });
  drawBeaconGlyphs(frame.context, grid, { spacing: unit(params, "spacing"), sourceColour: textParam(params, "colour") === "source" });
};

const percent = (key: string, label: string, defaultValue: number, advanced = false): FrameStyleDefinition["params"][number] => ({
  kind: "number", key, label, min: 0, max: 100, step: 1, default: defaultValue, suffix: "%", advanced,
});

export const BEACON_STYLE: FrameStyleDefinition = {
  id: "beacon",
  label: "Beacon",
  hint: "Glowing glyphs that trail light across the dark",
  glyph: "✸",
  category: "glitch",
  kind: "frame",
  params: [
    percent("size", "Cell size", 8),
    percent("tail", "Tail", 36),
    percent("glow", "Glow", 45),
    percent("spacing", "Spacing", 0, true),
    percent("radius", "Glow spread", 0, true),
    percent("opacity", "Glow strength", 14, true),
    { kind: "number", key: "angle", label: "Direction", min: 0, max: 360, step: 1, default: 0, suffix: "°", advanced: true },
    { kind: "toggle", key: "auto", label: "Follow the light", default: false, advanced: true, hint: "Points the trails toward the brightest area" },
    { kind: "select", key: "colour", label: "Colour", options: [{ value: "source", label: "From the photo" }, { value: "white", label: "White" }], default: "source", advanced: true },
    ...frameToneParams(),
  ],
  renderFrame: renderBeacon,
};

export const BEACON_LOOKS: readonly StyleLook[] = [
  { name: "Night signal", params: {}, effects: bloom(30) },
  { name: "Long trails", params: { tail: 80, glow: 60, opacity: 18 }, effects: bloom(34) },
  { name: "Falling light", params: { angle: 90, tail: 55, opacity: 24 }, effects: combine(bloom(30), vignette(35)) },
  { name: "White beacon", params: { colour: "white", glow: 55, opacity: 22 }, effects: combine(tint("#9ed8ff", 26, "screen"), vignette(40)) },
  { name: "Big cells", params: { size: 30, tail: 45, opacity: 20 }, effects: scanlines(18) },
];
