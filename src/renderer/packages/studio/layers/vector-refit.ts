import type { BezierAnchor, BezierHandle, VectorLayer } from "@bitgrain/studio-core/model/studio-types";
import { computeAnchorBbox, VECTOR_PAD } from "@bitgrain/studio-core/layers/studio-layers";

const PERCENT = 100;
const MIN_SIZE = 1;
const SIZE_TOLERANCE = 0.5;
const HALF = 2;
const DEGREES_TO_RADIANS = Math.PI / 180;

type PointMapper = (point: BezierHandle) => BezierHandle;

const mapAnchor = (anchor: BezierAnchor, map: PointMapper): BezierAnchor => ({
  ...anchor,
  ...map(anchor),
  inHandle: anchor.inHandle ? map(anchor.inHandle) : undefined,
  outHandle: anchor.outHandle ? map(anchor.outHandle) : undefined,
});

const isSameBox = (layer: VectorLayer, x: number, y: number, width: number, height: number): boolean =>
  Math.abs(layer.x - x) < SIZE_TOLERANCE &&
  Math.abs(layer.y - y) < SIZE_TOLERANCE &&
  Math.abs(layer.width - width) < SIZE_TOLERANCE &&
  Math.abs(layer.height - height) < SIZE_TOLERANCE;

const toWorldOffset = (layer: VectorLayer, offset: BezierHandle): BezierHandle => {
  const flippedX = layer.flipH ? -offset.x : offset.x;
  const flippedY = layer.flipV ? -offset.y : offset.y;
  const angle = (layer.rotation ?? 0) * DEGREES_TO_RADIANS;
  return {
    x: flippedX * Math.cos(angle) - flippedY * Math.sin(angle),
    y: flippedX * Math.sin(angle) + flippedY * Math.cos(angle),
  };
};

export function refitVectorLayer(layer: VectorLayer): Partial<VectorLayer> | null {
  if (layer.path.anchors.length === 0) return null;
  const toLocal: PointMapper = (point) => ({
    x: (point.x / PERCENT) * layer.width,
    y: (point.y / PERCENT) * layer.height,
  });
  const rings = [layer.path.anchors, ...(layer.path.extraRings ?? [])].map((ring) =>
    ring.map((anchor) => mapAnchor(anchor, toLocal)),
  );
  const bbox = computeAnchorBbox(rings.flat());
  const left = Math.round(bbox.minX - VECTOR_PAD);
  const top = Math.round(bbox.minY - VECTOR_PAD);
  const width = Math.max(Math.round(bbox.maxX - bbox.minX + VECTOR_PAD * 2), MIN_SIZE);
  const height = Math.max(Math.round(bbox.maxY - bbox.minY + VECTOR_PAD * 2), MIN_SIZE);
  const centerShift = toWorldOffset(layer, {
    x: left + width / HALF - layer.width / HALF,
    y: top + height / HALF - layer.height / HALF,
  });
  const x = Math.round(layer.x + layer.width / HALF + centerShift.x - width / HALF);
  const y = Math.round(layer.y + layer.height / HALF + centerShift.y - height / HALF);
  if (isSameBox(layer, x, y, width, height)) return null;
  const toPercent: PointMapper = (point) => ({
    x: ((point.x - left) / width) * PERCENT,
    y: ((point.y - top) / height) * PERCENT,
  });
  const [anchors, ...extraRings] = rings.map((ring) => ring.map((anchor) => mapAnchor(anchor, toPercent)));
  const path = { ...layer.path, anchors, ...(layer.path.extraRings ? { extraRings } : {}) };
  return { x, y, width, height, path };
}
