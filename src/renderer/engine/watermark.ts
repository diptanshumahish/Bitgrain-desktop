const WATERMARK_TEXT = "bitgrain.app";
const LOGO_SRC = "/bitgrainlogo.png";

const WATERMARK_FONT_STACK =
  'ui-sans-serif, system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
const WATERMARK_FONT_WEIGHT = 500;

const FONT_RATIO = 0.016;
const FONT_MIN_PX = 11;
const FONT_MAX_PX = 20;
const PAD_X_RATIO = 0.95;
const PAD_Y_RATIO = 0.62;
const MARGIN_RATIO = 1.5;
const LOGO_SIZE_RATIO = 1.3;
const LOGO_TEXT_GAP_RATIO = 0.55;
const TEXT_BASELINE_RATIO = 0.82;
const PILL_FILL = "rgba(17, 17, 17, 0.55)";
const TEXT_FILL = "rgba(255, 255, 255, 0.96)";

interface PillLayout {
  pillX: number;
  pillY: number;
  pillWidth: number;
  pillHeight: number;
  radius: number;
  logoX: number;
  logoY: number;
  logoSize: number;
  textX: number;
  textBaselineY: number;
  fontPx: number;
}

let cachedLogo: Promise<HTMLImageElement | null> | null = null;

export function preloadWatermarkLogo(): Promise<HTMLImageElement | null> {
  if (cachedLogo) return cachedLogo;
  cachedLogo = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = LOGO_SRC;
  });
  return cachedLogo;
}

function clampFontPx(
  minDim: number,
  ratio: number,
  minPx: number,
  maxPx: number,
): number {
  return Math.max(minPx, Math.min(maxPx, Math.round(minDim * ratio)));
}

function computePillLayout(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  hasLogo: boolean,
): PillLayout {
  const minDim = Math.min(canvasWidth, canvasHeight);
  const fontPx = clampFontPx(minDim, FONT_RATIO, FONT_MIN_PX, FONT_MAX_PX);
  const padX = Math.round(fontPx * PAD_X_RATIO);
  const padY = Math.round(fontPx * PAD_Y_RATIO);
  const margin = Math.round(fontPx * MARGIN_RATIO);
  const logoSize = Math.round(fontPx * LOGO_SIZE_RATIO);
  const logoGap = hasLogo ? Math.round(fontPx * LOGO_TEXT_GAP_RATIO) : 0;
  const logoSlot = hasLogo ? logoSize + logoGap : 0;

  ctx.font = `${WATERMARK_FONT_WEIGHT} ${fontPx}px ${WATERMARK_FONT_STACK}`;
  const textWidth = ctx.measureText(WATERMARK_TEXT).width;
  const pillWidth = textWidth + logoSlot + padX * 2;
  const pillHeight = Math.max(fontPx, logoSize) + padY * 2;
  const pillX = canvasWidth - pillWidth - margin;
  const pillY = canvasHeight - pillHeight - margin;
  const logoX = pillX + padX;
  const logoY = pillY + (pillHeight - logoSize) / 2;
  const textX = logoX + logoSlot;
  const textBaselineY =
    pillY + (pillHeight - fontPx) / 2 + fontPx * TEXT_BASELINE_RATIO;

  return {
    pillX,
    pillY,
    pillWidth,
    pillHeight,
    radius: pillHeight / 2,
    logoX,
    logoY,
    logoSize,
    textX,
    textBaselineY,
    fontPx,
  };
}

function drawPillBackground(
  ctx: CanvasRenderingContext2D,
  layout: PillLayout,
): void {
  ctx.fillStyle = PILL_FILL;
  ctx.beginPath();
  ctx.roundRect(
    layout.pillX,
    layout.pillY,
    layout.pillWidth,
    layout.pillHeight,
    layout.radius,
  );
  ctx.fill();
}

function drawPillContent(
  ctx: CanvasRenderingContext2D,
  layout: PillLayout,
  logo: HTMLImageElement | null,
): void {
  if (logo) {
    ctx.drawImage(logo, layout.logoX, layout.logoY, layout.logoSize, layout.logoSize);
  }
  ctx.fillStyle = TEXT_FILL;
  ctx.font = `${WATERMARK_FONT_WEIGHT} ${layout.fontPx}px ${WATERMARK_FONT_STACK}`;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
  ctx.fillText(WATERMARK_TEXT, layout.textX, layout.textBaselineY);
}

export function drawWatermarkPill(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  logo: HTMLImageElement | null,
): void {
  ctx.save();
  const layout = computePillLayout(ctx, width, height, !!logo);
  drawPillBackground(ctx, layout);
  drawPillContent(ctx, layout, logo);
  ctx.restore();
}

export async function applyPngWatermark(canvas: HTMLCanvasElement): Promise<void> {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const logo = await preloadWatermarkLogo();
  drawWatermarkPill(ctx, canvas.width, canvas.height, logo);
}
