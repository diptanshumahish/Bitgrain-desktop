import type { Layer } from "@bitgrain/studio-core/model/studio-types";
import type { HandleDir } from "@bitgrain/studio-core/layers/handle-dir";

interface Point {
  x: number;
  y: number;
}

interface Frame {
  cos: number;
  sin: number;
  flipX: number;
  flipY: number;
}

const DEG_TO_RAD = Math.PI / 180;
const HALF = 2;

const layerRotation = (layer: Layer): number => (layer as { rotation?: number }).rotation ?? 0;

const layerFrame = (layer: Layer): Frame => {
  const radians = layerRotation(layer) * DEG_TO_RAD;
  return {
    cos: Math.cos(radians),
    sin: Math.sin(radians),
    flipX: layer.flipH ? -1 : 1,
    flipY: layer.flipV ? -1 : 1,
  };
};

export const isTransformedLayer = (layer: Layer): boolean =>
  layerRotation(layer) % 360 !== 0 || Boolean(layer.flipH) || Boolean(layer.flipV);

export const toLocalDelta = (layer: Layer, dx: number, dy: number): Point => {
  const frame = layerFrame(layer);
  return {
    x: frame.flipX * (frame.cos * dx + frame.sin * dy),
    y: frame.flipY * (frame.cos * dy - frame.sin * dx),
  };
};

const anchorFraction = (dir: HandleDir, growSide: string, shrinkSide: string): number => {
  if (dir.includes(growSide)) return 0;
  if (dir.includes(shrinkSide)) return 1;
  return 1 / HALF;
};

const anchorInWorld = (layer: Layer, dir: HandleDir): Point => {
  const frame = layerFrame(layer);
  const offsetX = (anchorFraction(dir, "e", "w") - 1 / HALF) * layer.width * frame.flipX;
  const offsetY = (anchorFraction(dir, "s", "n") - 1 / HALF) * layer.height * frame.flipY;
  return {
    x: layer.x + layer.width / HALF + frame.cos * offsetX - frame.sin * offsetY,
    y: layer.y + layer.height / HALF + frame.sin * offsetX + frame.cos * offsetY,
  };
};

export const keepAnchorFixed = (before: Layer, after: Layer, dir: HandleDir): Partial<Layer> => {
  const start = anchorInWorld(before, dir);
  const end = anchorInWorld(after, dir);
  return { x: after.x + start.x - end.x, y: after.y + start.y - end.y };
};
