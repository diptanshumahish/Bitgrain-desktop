import { signal } from "../../../lib/signal";
import { imageMetaSignal } from "../../../store/image-store";
import { compareModeSignal } from "../../../store/editor-view-store";

export interface PreviewView {
  scale: number;
  x: number;
  y: number;
  fit: boolean;
}

const BASE_SCALE = 1;
const MIN_SCALE = 0.25;
const MAX_SCALE = 12;
const FIT_SNAP_TOLERANCE = 0.03;
const STAGE_PADDING_PX = 64;
const PAN_EDGE_MARGIN_PX = 48;
const ZOOM_STEP_FACTOR = 1.5;
const PERCENT = 100;
const PREVIEW_CANVAS_ID = "transformation-output-canvas";
export const PREVIEW_STAGE_ID = "editor-zoom-stage";

export type ZoomDirection = "in" | "out";

export const previewViewSignal = signal<PreviewView>({ scale: BASE_SCALE, x: 0, y: 0, fit: true });

export const clampScale = (scale: number): number => Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale));

const unscaledCanvasSize = (): { width: number; height: number } | null => {
  const canvas = document.getElementById(PREVIEW_CANVAS_ID);
  if (!canvas) return null;
  const rect = canvas.getBoundingClientRect();
  const scale = previewViewSignal.value.scale;
  if (rect.width <= 0 || rect.height <= 0) return null;
  return { width: rect.width / scale, height: rect.height / scale };
};

const fitScale = (): number => {
  const stage = document.getElementById(PREVIEW_STAGE_ID)?.getBoundingClientRect();
  const canvas = unscaledCanvasSize();
  if (!stage || !canvas || compareModeSignal.value) return BASE_SCALE;
  const fill = Math.min(
    (stage.width - STAGE_PADDING_PX) / canvas.width,
    (stage.height - STAGE_PADDING_PX) / canvas.height,
  );
  return clampScale(Math.max(BASE_SCALE, fill));
};

export const fitPreview = (): void => {
  previewViewSignal.value = { scale: fitScale(), x: 0, y: 0, fit: true };
};

export const refitIfFitting = (): void => {
  if (previewViewSignal.value.fit) fitPreview();
};

export const showActualPixels = (): void => {
  const naturalWidth = imageMetaSignal.value?.width;
  const canvas = unscaledCanvasSize();
  if (!naturalWidth || !canvas) return;
  previewViewSignal.value = { scale: clampScale(naturalWidth / canvas.width), x: 0, y: 0, fit: false };
};

export const zoomAround = (factor: number, offsetX: number, offsetY: number): void => {
  const current = previewViewSignal.value;
  const scale = clampScale(current.scale * factor);
  if (Math.abs(scale - fitScale()) < FIT_SNAP_TOLERANCE) {
    fitPreview();
    return;
  }
  const ratio = scale / current.scale;
  previewViewSignal.value = clampPan({
    scale,
    x: offsetX - (offsetX - current.x) * ratio,
    y: offsetY - (offsetY - current.y) * ratio,
    fit: false,
  });
};

const panLimit = (scaledLength: number, stageLength: number): number =>
  Math.max(0, (scaledLength - stageLength) / 2 + PAN_EDGE_MARGIN_PX);

const clampPan = (view: PreviewView): PreviewView => {
  const stage = document.getElementById(PREVIEW_STAGE_ID)?.getBoundingClientRect();
  const canvas = unscaledCanvasSize();
  if (!stage || !canvas) return view;
  const maxX = panLimit(canvas.width * view.scale, stage.width);
  const maxY = panLimit(canvas.height * view.scale, stage.height);
  return { ...view, x: Math.min(maxX, Math.max(-maxX, view.x)), y: Math.min(maxY, Math.max(-maxY, view.y)) };
};

export const panBy = (deltaX: number, deltaY: number): void => {
  const current = previewViewSignal.value;
  previewViewSignal.value = clampPan({ ...current, x: current.x + deltaX, y: current.y + deltaY });
};

export const isZoomedIn = (): boolean => !previewViewSignal.value.fit;

export const zoomStep = (direction: ZoomDirection): void => {
  zoomAround(direction === "in" ? ZOOM_STEP_FACTOR : 1 / ZOOM_STEP_FACTOR, 0, 0);
};

export const actualPixelPercent = (): number | null => {
  const naturalWidth = imageMetaSignal.value?.width;
  const canvas = unscaledCanvasSize();
  if (!naturalWidth || !canvas) return null;
  return Math.round(((canvas.width * previewViewSignal.value.scale) / naturalWidth) * PERCENT);
};
