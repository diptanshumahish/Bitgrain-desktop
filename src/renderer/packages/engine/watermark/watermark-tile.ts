import { WATERMARK_FONT_STACK, WATERMARK_FONT_WEIGHT, WATERMARK_TEXT } from "./watermark-font";

const TILE_FONT_RATIO = 0.036;
const TILE_FONT_MIN_PX = 14;
const TILE_FONT_MAX_PX = 110;
const TILE_ANGLE_RAD = -Math.PI / 6;
const TILE_GAP_X_RATIO = 3.6;
const TILE_ROW_HEIGHT_RATIO = 4.6;
const TILE_ROWS = 2;
const HALF = 0.5;
const SHADOW_OFFSET_RATIO = 0.05;
const LIGHT_INK = "rgba(255, 255, 255, 0.24)";
const DARK_INK = "rgba(0, 0, 0, 0.16)";

const tileCache = new Map<number, HTMLCanvasElement>();

function tileFontPx(width: number, height: number): number {
  const minDim = Math.min(width, height);
  return Math.max(TILE_FONT_MIN_PX, Math.min(TILE_FONT_MAX_PX, Math.round(minDim * TILE_FONT_RATIO)));
}

function drawTileWord(ctx: CanvasRenderingContext2D, x: number, y: number, fontPx: number): void {
  const offset = Math.max(1, Math.round(fontPx * SHADOW_OFFSET_RATIO));
  ctx.fillStyle = DARK_INK;
  ctx.fillText(WATERMARK_TEXT, x + offset, y + offset);
  ctx.fillStyle = LIGHT_INK;
  ctx.fillText(WATERMARK_TEXT, x, y);
}

function buildTile(fontPx: number): HTMLCanvasElement {
  const tile = document.createElement("canvas");
  const probe = tile.getContext("2d");
  const font = `${WATERMARK_FONT_WEIGHT} ${fontPx}px ${WATERMARK_FONT_STACK}`;
  if (!probe) return tile;
  probe.font = font;
  const cellWidth = Math.ceil(probe.measureText(WATERMARK_TEXT).width + fontPx * TILE_GAP_X_RATIO);
  const rowHeight = Math.ceil(fontPx * TILE_ROW_HEIGHT_RATIO);
  tile.width = cellWidth;
  tile.height = rowHeight * TILE_ROWS;
  const ctx = tile.getContext("2d");
  if (!ctx) return tile;
  ctx.font = font;
  ctx.textBaseline = "middle";
  drawTileWord(ctx, 0, rowHeight * HALF, fontPx);
  drawTileWord(ctx, cellWidth * HALF, rowHeight * (1 + HALF), fontPx);
  drawTileWord(ctx, -cellWidth * HALF, rowHeight * (1 + HALF), fontPx);
  return tile;
}

function tileFor(fontPx: number): HTMLCanvasElement {
  const cached = tileCache.get(fontPx);
  if (cached) return cached;
  const tile = buildTile(fontPx);
  tileCache.set(fontPx, tile);
  return tile;
}

export function drawWatermarkTile(ctx: CanvasRenderingContext2D, width: number, height: number): void {
  const pattern = ctx.createPattern(tileFor(tileFontPx(width, height)), "repeat");
  if (!pattern) return;
  const diagonal = Math.ceil(Math.hypot(width, height));
  ctx.save();
  ctx.translate(width * HALF, height * HALF);
  ctx.rotate(TILE_ANGLE_RAD);
  ctx.fillStyle = pattern;
  ctx.fillRect(-diagonal, -diagonal, diagonal * 2, diagonal * 2);
  ctx.restore();
}
