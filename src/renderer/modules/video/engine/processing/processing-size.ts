export const PREVIEW_MAX_WIDTH = 540;
const MIN_PROCESSING_EDGE = 8;

export interface ProcessingSize {
  w: number;
  h: number;
}

export function pickProcessingSize(srcW: number, srcH: number, maxWidth: number): ProcessingSize {
  const scale = Math.min(1, maxWidth / Math.max(srcW, 1));
  return {
    w: Math.max(MIN_PROCESSING_EDGE, Math.floor(srcW * scale)),
    h: Math.max(MIN_PROCESSING_EDGE, Math.floor(srcH * scale)),
  };
}
