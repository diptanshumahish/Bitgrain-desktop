import { WATERMARK_FONT_FAMILY, WATERMARK_FONT_STACK, WATERMARK_FONT_WEIGHT, WATERMARK_TEXT } from "./watermark-font";
import { drawWatermarkTile } from "./watermark-tile";

const LOGO_SRC = "/bitgrainlogo.png";

const WATERMARK_FONT_PROBE = `${WATERMARK_FONT_WEIGHT} 16px "${WATERMARK_FONT_FAMILY}"`;

const LOGO_CROP_X = 202;
const LOGO_CROP_Y = 232;
const LOGO_CROP_WIDTH = 687;
const LOGO_CROP_HEIGHT = 567;

const FONT_RATIO = 0.021;
const FONT_MIN_PX = 12;
const FONT_MAX_PX = 56;
const LETTER_SPACING_RATIO = -0.01;
const PAD_X_RATIO = 0.8;
const PAD_Y_RATIO = 0.56;
const MARGIN_RATIO = 1.1;
const RADIUS_RATIO = 0.32;
const LOGO_HEIGHT_RATIO = 0.82;
const LOGO_TEXT_GAP_RATIO = 0.5;
const TEXT_BASELINE_RATIO = 0.8;
const SHADOW_BLUR_RATIO = 0.9;
const SHADOW_OFFSET_RATIO = 0.12;
const BORDER_WIDTH_RATIO = 0.06;

const TAG_FILL = "#ffffff";
const TAG_BORDER = "rgba(10, 10, 10, 0.1)";
const TAG_SHADOW = "rgba(0, 0, 0, 0.16)";
const TEXT_FILL = "#0a0a0a";

interface TagLayout {
  tagX: number;
  tagY: number;
  tagWidth: number;
  tagHeight: number;
  radius: number;
  logoX: number;
  logoY: number;
  logoWidth: number;
  logoHeight: number;
  textX: number;
  textBaselineY: number;
  fontPx: number;
}

let cachedLogo: Promise<HTMLImageElement | null> | null = null;

function loadLogo(): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = LOGO_SRC;
  });
}

async function ensureWatermarkFont(): Promise<void> {
  if (typeof document === "undefined" || !document.fonts) return;
  try {
    await document.fonts.load(WATERMARK_FONT_PROBE);
  } catch {
    return;
  }
}

export function preloadWatermarkLogo(): Promise<HTMLImageElement | null> {
  if (cachedLogo) return cachedLogo;
  cachedLogo = ensureWatermarkFont().then(loadLogo);
  return cachedLogo;
}

function fontSizeFor(width: number, height: number): number {
  const minDim = Math.min(width, height);
  return Math.max(FONT_MIN_PX, Math.min(FONT_MAX_PX, Math.round(minDim * FONT_RATIO)));
}

function applyTextStyle(ctx: CanvasRenderingContext2D, fontPx: number): void {
  ctx.font = `${WATERMARK_FONT_WEIGHT} ${fontPx}px ${WATERMARK_FONT_STACK}`;
  ctx.letterSpacing = `${fontPx * LETTER_SPACING_RATIO}px`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}

function computeTagLayout(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  hasLogo: boolean,
): TagLayout {
  const fontPx = fontSizeFor(canvasWidth, canvasHeight);
  const padX = Math.round(fontPx * PAD_X_RATIO);
  const padY = Math.round(fontPx * PAD_Y_RATIO);
  const margin = Math.round(fontPx * MARGIN_RATIO);
  const logoHeight = hasLogo ? Math.round(fontPx * LOGO_HEIGHT_RATIO) : 0;
  const logoWidth = Math.round((logoHeight * LOGO_CROP_WIDTH) / LOGO_CROP_HEIGHT);
  const logoSlot = hasLogo ? logoWidth + Math.round(fontPx * LOGO_TEXT_GAP_RATIO) : 0;

  applyTextStyle(ctx, fontPx);
  const textWidth = ctx.measureText(WATERMARK_TEXT).width;
  const tagWidth = Math.round(textWidth + logoSlot + padX * 2);
  const tagHeight = fontPx + padY * 2;
  const tagX = canvasWidth - tagWidth - margin;
  const tagY = canvasHeight - tagHeight - margin;

  return {
    tagX,
    tagY,
    tagWidth,
    tagHeight,
    radius: Math.round(tagHeight * RADIUS_RATIO),
    logoX: tagX + padX,
    logoY: tagY + (tagHeight - logoHeight) / 2,
    logoWidth,
    logoHeight,
    textX: tagX + padX + logoSlot,
    textBaselineY: tagY + padY + fontPx * TEXT_BASELINE_RATIO,
    fontPx,
  };
}

function traceTag(ctx: CanvasRenderingContext2D, layout: TagLayout): void {
  ctx.beginPath();
  ctx.roundRect(layout.tagX, layout.tagY, layout.tagWidth, layout.tagHeight, layout.radius);
}

function drawTagBackground(ctx: CanvasRenderingContext2D, layout: TagLayout): void {
  ctx.save();
  ctx.shadowColor = TAG_SHADOW;
  ctx.shadowBlur = layout.fontPx * SHADOW_BLUR_RATIO;
  ctx.shadowOffsetY = layout.fontPx * SHADOW_OFFSET_RATIO;
  ctx.fillStyle = TAG_FILL;
  traceTag(ctx, layout);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = TAG_BORDER;
  ctx.lineWidth = Math.max(1, layout.fontPx * BORDER_WIDTH_RATIO);
  traceTag(ctx, layout);
  ctx.stroke();
}

function drawTagLogo(ctx: CanvasRenderingContext2D, layout: TagLayout, logo: HTMLImageElement): void {
  ctx.drawImage(
    logo,
    LOGO_CROP_X,
    LOGO_CROP_Y,
    LOGO_CROP_WIDTH,
    LOGO_CROP_HEIGHT,
    layout.logoX,
    layout.logoY,
    layout.logoWidth,
    layout.logoHeight,
  );
}

function drawTagText(ctx: CanvasRenderingContext2D, layout: TagLayout): void {
  applyTextStyle(ctx, layout.fontPx);
  ctx.fillStyle = TEXT_FILL;
  ctx.fillText(WATERMARK_TEXT, layout.textX, layout.textBaselineY);
}

export function drawWatermarkTag(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  logo: HTMLImageElement | null,
): void {
  drawWatermarkTile(ctx, width, height);
  drawWatermarkBadge(ctx, width, height, logo);
}

export function drawWatermarkBadge(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  logo: HTMLImageElement | null,
): void {
  ctx.save();
  const layout = computeTagLayout(ctx, width, height, !!logo);
  drawTagBackground(ctx, layout);
  if (logo) drawTagLogo(ctx, layout, logo);
  drawTagText(ctx, layout);
  ctx.restore();
}

export async function applyPngWatermark(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const logo = await preloadWatermarkLogo();
  drawWatermarkTag(ctx, canvas.width, canvas.height, logo);
}
