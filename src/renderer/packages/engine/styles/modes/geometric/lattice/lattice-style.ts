import { Frame } from "../../../engine/frame";
import type { FrameRenderInput, FrameStyleDefinition } from "../../../engine/style-definition";
import type { ParamValues } from "../../../engine/style-types";
import { numberParam, textParam } from "../../../engine/resolve-params";
import { FRAME_TONE_KEYS, frameToneParams, toneAdjustedSource } from "../../../finish/frame-tone";
import { drawSoftCopy, softCopy } from "../../../finish/soft-copy";
import type { RgbTriple } from "../../../postfx/pixel-ops";
import { addToBatch, fillDiscBatches, strokeSegmentBatches, type ColourBatches } from "../shared/colour-batches";
import { mixTriple } from "../shared/colour";
import { numberSpec, option, selectSpec } from "../shared/param-builders";
import { sourceCanvas } from "../shared/source-canvas";
import { buildLattice, type LatticeGrid } from "./lattice-nodes";

const PERCENT = 100;
const MIN_PITCH = 4;
const PITCH_BASE = 40;
const PITCH_RANGE = 36;
const MAX_NODES = 90000;
const VEIL_STRENGTH = 0.85;
const WIRE_BASE = 0.5;
const WIRE_GAIN = 3;
const NODE_BASE = 0.5;
const NODE_GAIN = 4;
const BLOOM_SIGMA = 6;
const ROUND_CAP_WIDTH = 2;
const BLOOM_ALPHA_BASE = 0.4;
const BLOOM_ALPHA_GAIN = 0.6;

type LinkSteps = readonly (readonly [number, number])[];

const ORTHO_LINKS: LinkSteps = [[1, 0], [0, 1]];
const DIAGONAL_LINKS: LinkSteps = [[1, 1], [-1, 1]];

const pitchFor = (params: ParamValues, width: number, height: number, scale: number): number => {
  let pitch = Math.max(MIN_PITCH * scale, Math.round((PITCH_BASE - (PITCH_RANGE * numberParam(params, "resolution")) / PERCENT) * scale));
  while ((width / pitch + 1) * (height / pitch + 1) > MAX_NODES) pitch++;
  return pitch;
};

const linksFor = (mode: string): LinkSteps =>
  mode === "ortho" ? ORTHO_LINKS : mode === "diag" ? DIAGONAL_LINKS : [...ORTHO_LINKS, ...DIAGONAL_LINKS];

const linkNode = (grid: LatticeGrid, batches: ColourBatches, index: number, links: LinkSteps): void => {
  const column = index % grid.columns;
  const row = Math.floor(index / grid.columns);
  for (const [stepX, stepY] of links) {
    const [otherColumn, otherRow] = [column + stepX, row + stepY];
    const other = otherRow * grid.columns + otherColumn;
    if (otherColumn < 0 || otherColumn >= grid.columns || otherRow >= grid.rows || !grid.active[other]) continue;
    addToBatch(batches, mixTriple(grid.colours[index], grid.colours[other], 0.5), column * grid.pitch, row * grid.pitch, otherColumn * grid.pitch, otherRow * grid.pitch);
  }
};

const wireBatches = (grid: LatticeGrid, links: LinkSteps): ColourBatches => {
  const batches: ColourBatches = new Map();
  for (let index = 0; index < grid.active.length; index++) {
    if (grid.active[index]) linkNode(grid, batches, index, links);
  }
  return batches;
};

const nodeBatches = (grid: LatticeGrid, radius: number): ColourBatches => {
  const batches: ColourBatches = new Map();
  for (let index = 0; index < grid.active.length; index++) {
    if (!grid.active[index]) continue;
    const colour: RgbTriple = grid.colours[index];
    addToBatch(batches, colour, (index % grid.columns) * grid.pitch, Math.floor(index / grid.columns) * grid.pitch, radius * (0.5 + 0.5 * grid.luma[index]));
  }
  return batches;
};

const paintMesh = (layer: Frame, grid: LatticeGrid, params: ParamValues, scale: number): void => {
  const context = layer.context;
  context.lineWidth = Math.max(0.5, (WIRE_BASE + (WIRE_GAIN * numberParam(params, "wireThickness")) / PERCENT) * scale);
  context.lineCap = context.lineWidth > ROUND_CAP_WIDTH ? "round" : "butt";
  context.globalAlpha = numberParam(params, "wireOpacity") / PERCENT;
  strokeSegmentBatches(context, wireBatches(grid, linksFor(textParam(params, "connections"))));
  context.globalAlpha = 1;
  fillDiscBatches(context, nodeBatches(grid, Math.max(0.5, (NODE_BASE + (NODE_GAIN * numberParam(params, "nodeSize")) / PERCENT) * scale)));
};

const paintBackdrop = (input: FrameRenderInput, dim: number): void => {
  const context = input.frame.context;
  context.drawImage(sourceCanvas(toneAdjustedSource(input.source, input.params)), 0, 0);
  context.fillStyle = `rgba(0,0,0,${VEIL_STRENGTH * dim})`;
  context.fillRect(0, 0, input.frame.width, input.frame.height);
};

const compositeLayer = (frame: Frame, layer: Frame, glow: number, scale: number): void => {
  const context = frame.context;
  if (glow > 0) {
    context.globalCompositeOperation = "lighter";
    context.globalAlpha = Math.min(1, BLOOM_ALPHA_BASE + BLOOM_ALPHA_GAIN * glow);
    drawSoftCopy(context, softCopy(layer.canvas, layer.width, layer.height, BLOOM_SIGMA * glow * scale), frame.width, frame.height);
    context.globalAlpha = 1;
    context.globalCompositeOperation = "source-over";
  }
  context.drawImage(layer.canvas, 0, 0);
};

const renderLattice = (input: FrameRenderInput): void => {
  const { params, frame, scale } = input;
  const toned = toneAdjustedSource(input.source, params);
  const grid = buildLattice(toned, {
    pitch: pitchFor(params, frame.width, frame.height, scale), threshold: numberParam(params, "threshold") / PERCENT,
    confine: numberParam(params, "confine") / PERCENT, brightness: numberParam(params, FRAME_TONE_KEYS.brightness) / PERCENT, colourMode: textParam(params, "colour"),
  });
  paintBackdrop(input, numberParam(params, "dim") / PERCENT);
  const layer = new Frame(frame.width, frame.height);
  paintMesh(layer, grid, params, scale);
  compositeLayer(frame, layer, numberParam(params, "glow") / PERCENT, scale);
};

export const LATTICE_STYLE: FrameStyleDefinition = {
  id: "lattice",
  label: "Lattice",
  hint: "A glowing wire mesh over the bright parts",
  glyph: "▦",
  category: "geometric",
  kind: "frame",
  params: [
    numberSpec({ key: "resolution", label: "Density", min: 0, max: 100, value: 69, suffix: "%" }),
    numberSpec({ key: "threshold", label: "Brightness cutoff", min: 0, max: 100, value: 60, suffix: "%" }),
    numberSpec({ key: "glow", label: "Glow", min: 0, max: 100, value: 50, suffix: "%" }),
    numberSpec({ key: "nodeSize", label: "Node size", min: 0, max: 100, value: 20, suffix: "%", advanced: true }),
    numberSpec({ key: "wireThickness", label: "Line thickness", min: 0, max: 100, value: 15, suffix: "%", advanced: true }),
    numberSpec({ key: "wireOpacity", label: "Line opacity", min: 0, max: 100, value: 70, suffix: "%", advanced: true }),
    selectSpec("connections", "Connections", [option("both", "Grid and diagonals"), option("ortho", "Grid"), option("diag", "Diagonals")], "both", true),
    selectSpec("colour", "Colour", [option("source", "Photo"), option("vivid", "Vivid"), option("mono", "White")], "source", true),
    numberSpec({ key: "dim", label: "Background dim", min: 0, max: 100, value: 70, suffix: "%", advanced: true }),
    numberSpec({ key: "confine", label: "Subject focus", min: 0, max: 100, value: 55, suffix: "%", advanced: true, hint: "Higher keeps the mesh on the main subject" }),
    ...frameToneParams(),
  ],
  renderFrame: renderLattice,
};
