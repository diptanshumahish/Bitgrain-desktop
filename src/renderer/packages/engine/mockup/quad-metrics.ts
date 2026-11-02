import type { MockupPoint, MockupQuad } from "./mockup-types";

export interface ArtworkSpan {
  u: number;
  v: number;
}

export const FULL_SPAN: ArtworkSpan = { u: 1, v: 1 };

const pixelDistance = (from: MockupPoint, to: MockupPoint, imageWidth: number, imageHeight: number): number => {
  const deltaX = (from.x - to.x) * imageWidth;
  const deltaY = (from.y - to.y) * imageHeight;
  return Math.hypot(deltaX, deltaY);
};

export const quadAspectRatio = (corners: MockupQuad, imageWidth: number, imageHeight: number): number => {
  const [topLeft, topRight, bottomRight, bottomLeft] = corners;
  const topEdge = pixelDistance(topLeft, topRight, imageWidth, imageHeight);
  const bottomEdge = pixelDistance(bottomLeft, bottomRight, imageWidth, imageHeight);
  const leftEdge = pixelDistance(topLeft, bottomLeft, imageWidth, imageHeight);
  const rightEdge = pixelDistance(topRight, bottomRight, imageWidth, imageHeight);

  const averageWidth = (topEdge + bottomEdge) / 2;
  const averageHeight = (leftEdge + rightEdge) / 2;
  if (averageHeight <= 0) return 1;
  return averageWidth / averageHeight;
};

export const containArtworkSpan = (quadAspect: number, artworkAspect: number): ArtworkSpan => {
  if (!Number.isFinite(quadAspect) || !Number.isFinite(artworkAspect) || quadAspect <= 0 || artworkAspect <= 0) {
    return FULL_SPAN;
  }
  if (artworkAspect >= quadAspect) return { u: 1, v: quadAspect / artworkAspect };
  return { u: artworkAspect / quadAspect, v: 1 };
};
