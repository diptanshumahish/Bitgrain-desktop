import type { Layer } from "../../model/studio-types";
import type { PageAnimation, TrackGroupId } from "../../model/animation-types";
import { keyframed, toLottieTiming, colorToRgb, type Timeline, type LottieProp } from "./keyframes";
import type { PoseSampler } from "../export-timing/pose-sampler";
import { propertyTiming, ANCESTOR_GEOMETRY_GROUPS } from "../export-timing/property-timing";
import { groupForProp } from "../tracks/track-groups";
import type { Sampler, LottieItem } from "./layer-content";

const asRecord = (layer: Layer): Record<string, unknown> => layer as unknown as Record<string, unknown>;

export const numProp = (layer: Layer, prop: string, fallback: number): number => {
  const value = asRecord(layer)[prop];
  return typeof value === "number" ? value : fallback;
};

const strProp = (layer: Layer, prop: string, fallback: string): string => {
  const value = asRecord(layer)[prop];
  return typeof value === "string" ? value : fallback;
};

const rotationOf = (layer: Layer): number => numProp(layer, "rotation", 0);

export interface LeafContext {
  chain: Layer[];
  base: Layer;
  poses: PoseSampler;
  animation: PageAnimation;
  timeline: Timeline;
}

export const NO_GROUPS: readonly TrackGroupId[] = [];
export const PERCENT = 100;

const groupsForProps = (props: string[]): TrackGroupId[] => {
  const groups = props.map(groupForProp).filter((group): group is TrackGroupId => group !== null);
  return [...new Set(groups)];
};

export const animated = (
  context: LeafContext,
  groups: readonly TrackGroupId[],
  ancestorGroups: readonly TrackGroupId[],
  valueOf: (layer: Layer) => number[],
): LottieProp => {
  const timing = toLottieTiming(
    propertyTiming(context.chain, groups, context.animation, ancestorGroups),
    context.timeline,
  );
  const states = timing.timesMs.map((timeMs) => valueOf(context.poses(timeMs).get(context.base.id) ?? context.base));
  return keyframed(states, timing);
};

export const leafSampler = (context: LeafContext): Sampler => ({
  numeric: (prop, fallback) =>
    animated(context, groupsForProps([prop]), NO_GROUPS, (layer) => [numProp(layer, prop, fallback)]),
  tuple: ([propA, propB], [baseA, baseB]) =>
    animated(context, groupsForProps([propA, propB]), NO_GROUPS, (layer) => [
      numProp(layer, propA, baseA),
      numProp(layer, propB, baseB),
    ]),
  color: (prop, fallback) =>
    animated(context, groupsForProps([prop]), NO_GROUPS, (layer) => colorToRgb(strProp(layer, prop, fallback))),
});

const centerOf = (layer: Layer): number[] => [layer.x + layer.width / 2, layer.y + layer.height / 2];

export const sizeScale = (context: LeafContext): LottieProp => {
  const baseWidth = context.base.width || 1;
  const baseHeight = context.base.height || 1;
  return animated(context, ["size"], NO_GROUPS, (layer) => [
    (layer.width / baseWidth) * PERCENT,
    (layer.height / baseHeight) * PERCENT,
  ]);
};

interface TransformInput {
  anchor: [number, number];
  position: LottieProp;
  scale: LottieProp;
}

export const buildTransform = (input: TransformInput, context: LeafContext): LottieItem => ({
  a: { a: 0, k: [input.anchor[0], input.anchor[1], 0] },
  p: input.position,
  s: input.scale,
  r: animated(context, ["rotation"], NO_GROUPS, (layer) => [rotationOf(layer)]),
  o: animated(context, ["opacity"], NO_GROUPS, (layer) => [layer.opacity * PERCENT]),
});

export const centerPosition = (context: LeafContext): LottieProp =>
  animated(context, ["position", "size"], ANCESTOR_GEOMETRY_GROUPS, centerOf);

