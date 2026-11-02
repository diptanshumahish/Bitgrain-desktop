const REFERENCE_LONG_EDGE = 1280;

export const styleScaleFor = (width: number, height: number): number =>
  Math.max(width, height) / REFERENCE_LONG_EDGE;
