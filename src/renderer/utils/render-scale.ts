const RENDER_SCALE_STEP = 0.5;

export const quantizeRenderScale = (scale: number): number =>
  Math.max(1, Math.ceil(scale / RENDER_SCALE_STEP) * RENDER_SCALE_STEP);
