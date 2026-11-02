import type { FrameRenderInput, FrameStyleDefinition } from "../../../../engine/style-definition";
import type { ParamSpec, StyleLook } from "../../../../engine/style-types";
import { numberParam, textParam } from "../../../../engine/resolve-params";
import { frameToneParams, toneAdjustedSource } from "../../../../finish/frame-tone";
import { chromatic, combine, grain, vignette } from "../../../../looks/look-builders";
import { PERCENT } from "../../shared/signal-math";
import { DEFAULT_INKS, INK_KEYS, inkRamp } from "./ink-ramp";
import { shadeMosh, type MoshJob } from "./datamosh-shade";

const LAYOUT_SEED_GAIN = 17;
const INK_LABELS: readonly string[] = ["Shadow ink", "Low ink", "High ink", "Light ink"];

const unit = (params: FrameRenderInput["params"], key: string): number => numberParam(params, key) / PERCENT;

const jobFor = ({ source, params, scale }: FrameRenderInput): MoshJob => ({
  source: toneAdjustedSource(source, params),
  layout: { block: unit(params, "block"), scatter: unit(params, "scatter"), displace: unit(params, "displace"), seed: Math.round(numberParam(params, "layout") * LAYOUT_SEED_GAIN), scale },
  inks: inkRamp(INK_KEYS.map((key) => textParam(params, key))),
  split: unit(params, "split"),
  duotone: unit(params, "duotone"),
  smear: unit(params, "smear"),
  grain: unit(params, "grain"),
  gain: unit(params, "intensity"),
  tile: { sampleX: 0, sampleY: 0, torn: false, smear: false, isVoid: false, ants: false, edgeDistance: 0, voidShade: 0 },
  colour: [0, 0, 0],
});

const renderDatamosh = (input: FrameRenderInput): void => {
  const job = jobFor(input);
  const out = input.frame.pixels().data;
  for (let y = 0; y < job.source.height; y++) {
    for (let x = 0; x < job.source.width; x++) shadeMosh(job, out, x, y);
  }
};

const percent = (key: string, label: string, defaultValue: number, advanced = false, max = PERCENT): ParamSpec => ({
  kind: "number", key, label, min: 0, max, step: 1, default: defaultValue, suffix: "%", advanced,
});

const inkParams: readonly ParamSpec[] = INK_KEYS.map((key, index) => ({
  kind: "colour", key, label: INK_LABELS[index], default: DEFAULT_INKS[index], advanced: true,
}));

export const DATAMOSH_STYLE: FrameStyleDefinition = {
  id: "datamosh",
  label: "Datamosh",
  hint: "Broken video blocks remapped to bold inks",
  glyph: "▞",
  category: "glitch",
  kind: "frame",
  params: [
    percent("block", "Block size", 22),
    percent("scatter", "Scatter", 22),
    percent("duotone", "Ink mix", 90),
    percent("displace", "Jump distance", 65, true),
    percent("smear", "Smear", 45, true),
    percent("split", "RGB split", 45, true),
    percent("grain", "Noise", 30, true),
    percent("intensity", "Strength", 100, true, 2 * PERCENT),
    { kind: "number", key: "layout", label: "Layout", min: 1, max: 100, step: 1, default: 4, advanced: true, hint: "Try another number for a new pattern" },
    ...inkParams,
    ...frameToneParams(),
  ],
  renderFrame: renderDatamosh,
};

export const DATAMOSH_LOOKS: readonly StyleLook[] = [
  { name: "Sunset mosh", params: {}, effects: chromatic(3) },
  { name: "Acid", params: { ink1: "#06140c", ink2: "#1f7a3a", ink3: "#b6ff3c", ink4: "#f4ffe0", scatter: 30 }, effects: chromatic(3) },
  { name: "Ice blocks", params: { ink1: "#020b1a", ink2: "#1b4f9c", ink3: "#58c7ff", ink4: "#eaf8ff", block: 35 }, effects: vignette(30) },
  { name: "True colour", params: { duotone: 0, scatter: 30, split: 60 }, effects: grain(16) },
  { name: "Heavy", params: { block: 45, scatter: 45, displace: 85, smear: 70 }, effects: combine(chromatic(4), vignette(35)) },
];
