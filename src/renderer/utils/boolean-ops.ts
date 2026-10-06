import polygonClipping from "polygon-clipping";
import type { Polygon, MultiPolygon, Ring } from "polygon-clipping";
import type {
  BezierAnchor,
  Layer,
  ShapeLayer,
  VectorLayer,
} from "../data/studioTypes";
import { flattenPath, polygonToAnchors } from "./path-flatten";
import { shapeToVectorLayer } from "./shape-to-vector";

export type BooleanOp = "union" | "subtract" | "intersect" | "exclude";

const VECTOR_PAD = 4;

const DEGREES_TO_RADIANS = Math.PI / 180;

const toWorldPoint = (layer: VectorLayer, nx: number, ny: number): [number, number] => {
  const halfW = layer.width / 2;
  const halfH = layer.height / 2;
  const localX = ((nx / 100) * layer.width - halfW) * (layer.flipH ? -1 : 1);
  const localY = ((ny / 100) * layer.height - halfH) * (layer.flipV ? -1 : 1);
  const angle = (layer.rotation ?? 0) * DEGREES_TO_RADIANS;
  const cos = Math.cos(angle);
  const sin = Math.sin(angle);
  return [
    layer.x + halfW + localX * cos - localY * sin,
    layer.y + halfH + localX * sin + localY * cos,
  ];
};

const sampledWorldGeom = (layer: VectorLayer): MultiPolygon => {
  const pieces = [
    layer.path,
    ...(layer.path.extraRings ?? []).map((anchors) => ({ anchors, closed: true })),
  ];
  const polygons: Polygon[] = pieces
    .map((piece) => flattenPath(piece).map(([nx, ny]) => toWorldPoint(layer, nx, ny)))
    .filter((ring) => ring.length >= 3)
    .map((ring) => [ring]);
  if (polygons.length <= 1) return polygons;
  const [first, ...rest] = polygons;
  return polygonClipping.xor(first, ...rest);
};

const ensureVectorLayer = (layer: Layer): VectorLayer | null => {
  if (layer.type === "vector") return layer;
  if (layer.type === "shape") return shapeToVectorLayer(layer as ShapeLayer);
  return null;
};

const runOp = (op: BooleanOp, geom: MultiPolygon, others: MultiPolygon[]): MultiPolygon => {
  switch (op) {
    case "union":
      return polygonClipping.union(geom, ...others);
    case "subtract":
      return polygonClipping.difference(geom, ...others);
    case "intersect":
      return polygonClipping.intersection(geom, ...others);
    case "exclude":
      return polygonClipping.xor(geom, ...others);
  }
};

const collectRings = (multi: MultiPolygon): Ring[] => {
  const rings: Ring[] = [];
  for (const polygon of multi) {
    for (const ring of polygon) {
      if (ring.length >= 3) rings.push(ring);
    }
  }
  return rings;
};

const buildLayerFromWorldRings = (
  rings: Ring[],
  source: VectorLayer,
  index: number,
): VectorLayer | null => {
  if (rings.length === 0) return null;
  const allPoints = rings.flat();
  const xs = allPoints.map((p) => p[0]);
  const ys = allPoints.map((p) => p[1]);
  const minX = Math.min(...xs) - VECTOR_PAD;
  const minY = Math.min(...ys) - VECTOR_PAD;
  const maxX = Math.max(...xs) + VECTOR_PAD;
  const maxY = Math.max(...ys) + VECTOR_PAD;
  const width = Math.max(1, Math.round(maxX - minX));
  const height = Math.max(1, Math.round(maxY - minY));

  const normalizeRing = (ring: Ring): BezierAnchor[] =>
    polygonToAnchors(ring.map(([x, y]) => [((x - minX) / width) * 100, ((y - minY) / height) * 100]));
  const [primary, ...others] = rings;

  return {
    id: `vector-${Date.now()}-${index}`,
    type: "vector",
    name: `${source.name} merged`,
    x: Math.round(minX),
    y: Math.round(minY),
    width,
    height,
    opacity: source.opacity,
    locked: false,
    visible: true,
    blendMode: source.blendMode,
    flipH: false,
    flipV: false,
    rotation: 0,
    path: {
      anchors: normalizeRing(primary),
      closed: true,
      ...(others.length ? { extraRings: others.map(normalizeRing) } : {}),
    },
    fill: source.fill,
    strokeColor: source.strokeColor,
    strokeWidth: source.strokeWidth,
    lineCap: source.lineCap,
    lineJoin: source.lineJoin,
    dashStyle: source.dashStyle,
  };
};

export const applyBooleanOp = (
  op: BooleanOp,
  layers: Layer[],
  index: number,
): VectorLayer | null => {
  const vectors = layers
    .map(ensureVectorLayer)
    .filter((value): value is VectorLayer => value !== null);
  if (vectors.length < 2) return null;

  const polygons: MultiPolygon[] = vectors
    .map(sampledWorldGeom)
    .filter((geom) => geom.length > 0);
  if (polygons.length < 2) return null;

  const [first, ...rest] = polygons;
  const result = runOp(op, first, rest);
  const rings = collectRings(result);
  return buildLayerFromWorldRings(rings, vectors[0], index);
};
