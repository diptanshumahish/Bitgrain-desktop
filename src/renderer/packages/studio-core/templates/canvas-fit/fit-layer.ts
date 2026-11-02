import type { FrameLayer, Layer, ShapeType } from "../../model/studio-types";
import { scaleLayer } from "../scale-template";
import { makeFitContext, type FitBox, type FitContext } from "./fit-context";
import { layoutAxis } from "./axis-layout";
import { stackColumnsIfTaller, type FlowSource } from "./stack-columns";
import { bleedToTouchedEdges } from "./edge-bleed";
import { growAroundCenter, readableTextScale } from "./readable-text";
import { keepOnCanvas } from "./keep-on-canvas";

interface PlacedBox extends FitBox {
  stretched: boolean;
}

interface AxisStretch {
  x: boolean;
  y: boolean;
}

const STRETCHABLE_SHAPES: ShapeType[] = ["rect", "line", "frame-thin", "frame-thick", "frame-round", "frame-double"];
const SPAN_EDGE_TOLERANCE = 0.05;
const THIN_DIVIDER_RATIO = 0.02;

const round = (value: number): number => Math.round(value * 100) / 100;

const isUnrotated = (layer: Layer): boolean => !("rotation" in layer) || !layer.rotation;

const canStretch = (layer: Layer): boolean => {
  if (!isUnrotated(layer)) return false;
  if (layer.type === "shape") return STRETCHABLE_SHAPES.includes(layer.shapeType);
  return layer.type === "image" || layer.type === "upload" || layer.type === "adjustment" || layer.type === "frame";
};

const spansAxis = (start: number, size: number, length: number): boolean => {
  const tolerance = length * SPAN_EDGE_TOLERANCE;
  return start <= tolerance && start + size >= length - tolerance;
};

const isThinDivider = (layer: Layer, spans: AxisStretch, context: FitContext): boolean => {
  if (spans.x === spans.y) return false;
  const crossSize = spans.x ? layer.height / context.from.height : layer.width / context.from.width;
  return crossSize <= THIN_DIVIDER_RATIO;
};

const stretchOf = (layer: Layer, context: FitContext): AxisStretch => {
  const stretchable = canStretch(layer);
  const spans = {
    x: stretchable && spansAxis(layer.x, layer.width, context.from.width),
    y: stretchable && spansAxis(layer.y, layer.height, context.from.height),
  };
  return isThinDivider(layer, spans, context) ? { x: true, y: true } : spans;
};

const layoutFlowAxis = (layers: Layer[], stretches: AxisStretch[], axis: "x" | "y", context: FitContext): Map<number, number> => {
  const sizeKey = axis === "x" ? "width" : "height";
  const flowIndexes = layers.map((_, index) => index).filter((index) => !stretches[index][axis]);
  const spans = flowIndexes.map((index) => ({ start: layers[index][axis], size: layers[index][sizeKey] }));
  const target = { start: context.content[axis], length: context.content[sizeKey], scale: context.scale };
  const starts = layoutAxis(spans, context.from[sizeKey], target);
  return new Map(flowIndexes.map((layerIndex, spanIndex) => [layerIndex, starts[spanIndex]]));
};

const placeBox = (layer: Layer, stretch: AxisStretch, flow: { x?: number; y?: number }, context: FitContext, page: FitContext): PlacedBox => ({
  x: round(stretch.x ? layer.x * page.ratioX : flow.x ?? 0),
  y: round(stretch.y ? layer.y * page.ratioY : flow.y ?? 0),
  width: round(layer.width * (stretch.x ? page.ratioX : context.scale)),
  height: round(layer.height * (stretch.y ? page.ratioY : context.scale)),
  stretched: stretch.x || stretch.y,
});

const fitStretchedFrame = (frame: FrameLayer, box: PlacedBox): FrameLayer => ({
  ...frame,
  x: box.x,
  y: box.y,
  width: box.width,
  height: box.height,
  layers: fitLayers(frame.layers, makeFitContext(frame, box)),
});

const placeScaledLayer = (layer: Layer, box: PlacedBox, context: FitContext): Layer => {
  const placed = { ...scaleLayer(layer, context.scale), x: box.x, y: box.y, width: box.width, height: box.height };
  if (box.stretched && (placed.type === "image" || placed.type === "upload") && placed.fit === "fill") {
    return { ...placed, fit: "cover" };
  }
  return placed;
};

const fitPlacedLayer = (layer: Layer, box: PlacedBox, context: FitContext): Layer =>
  layer.type === "frame" && box.stretched ? fitStretchedFrame(layer, box) : placeScaledLayer(layer, box, context);

interface FlowPlan extends FlowSource {
  stretches: AxisStretch[];
  stacked: boolean;
}

const NO_STRETCH: AxisStretch = { x: false, y: false };

const flowPlanFor = (layers: Layer[], stretches: AxisStretch[], context: FitContext): FlowPlan => {
  const flowIndexes = layers.map((_, index) => index).filter((index) => !stretches[index].x || !stretches[index].y);
  const source = stackColumnsIfTaller(layers, flowIndexes, context);
  if (source.layers === layers) return { ...source, stretches, stacked: false };
  const stackedStretches = stretches.map((stretch) => (stretch.x && stretch.y ? stretch : NO_STRETCH));
  return { ...source, stretches: stackedStretches, stacked: true };
};

const withEdgeBleed = (layer: Layer, box: PlacedBox, plan: FlowPlan, context: FitContext): PlacedBox => {
  if (plan.stacked || !canStretch(layer)) return box;
  return { ...box, ...bleedToTouchedEdges(layer, box, context) };
};

const settleBox = (layer: Layer, box: PlacedBox, plan: FlowPlan, context: FitContext): PlacedBox => {
  const bled = withEdgeBleed(layer, box, plan, context);
  const settled = bled.stretched ? bled : { ...bled, ...keepOnCanvas(layer, bled, context.from, context.to) };
  return { ...settled, x: round(settled.x), y: round(settled.y), width: round(settled.width), height: round(settled.height) };
};

const withReadableText = (layer: Layer, box: PlacedBox, layerContext: FitContext, context: FitContext): { box: PlacedBox; scale: number } => {
  const scale = readableTextScale(layer, layerContext.scale, context);
  if (scale === layerContext.scale) return { box, scale };
  return { box: { ...box, ...growAroundCenter(box, layer, scale) }, scale };
};

export const fitLayers = (layers: Layer[], context: FitContext): Layer[] => {
  const plan = flowPlanFor(layers, layers.map((layer) => stretchOf(layer, context)), context);
  const flowContext = { ...context, from: plan.from, scale: plan.scale };
  const flowX = layoutFlowAxis(plan.layers, plan.stretches, "x", flowContext);
  const flowY = layoutFlowAxis(plan.layers, plan.stretches, "y", flowContext);
  return layers.map((layer, index) => {
    const stretch = plan.stretches[index];
    const layerContext = stretch.x && stretch.y ? context : flowContext;
    const placed = placeBox(layer, stretch, { x: flowX.get(index), y: flowY.get(index) }, layerContext, context);
    const readable = withReadableText(layer, placed, layerContext, context);
    return fitPlacedLayer(layer, settleBox(layer, readable.box, plan, context), { ...layerContext, scale: readable.scale });
  });
};
