export type AnimateFraming = "original" | "spotify-canvas";

export const SPOTIFY_CANVAS_WIDTH = 1080;
export const SPOTIFY_CANVAS_HEIGHT = 1920;

export function frameBaseCanvas(
  base: HTMLCanvasElement,
  framing: AnimateFraming,
): HTMLCanvasElement {
  if (framing === "original") return base;
  const framed = document.createElement("canvas");
  framed.width = SPOTIFY_CANVAS_WIDTH;
  framed.height = SPOTIFY_CANVAS_HEIGHT;
  const ctx = framed.getContext("2d");
  if (!ctx) return base;
  const coverScale = Math.max(
    SPOTIFY_CANVAS_WIDTH / base.width,
    SPOTIFY_CANVAS_HEIGHT / base.height,
  );
  const drawWidth = base.width * coverScale;
  const drawHeight = base.height * coverScale;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(
    base,
    (SPOTIFY_CANVAS_WIDTH - drawWidth) / 2,
    (SPOTIFY_CANVAS_HEIGHT - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
  return framed;
}

export function encodeLongEdgeFor(framing: AnimateFraming, defaultLongEdge: number): number {
  return framing === "spotify-canvas" ? SPOTIFY_CANVAS_HEIGHT : defaultLongEdge;
}
