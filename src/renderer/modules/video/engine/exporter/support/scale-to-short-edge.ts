export interface FrameSize {
  width: number;
  height: number;
}

function toEven(value: number): number {
  return Math.max(2, Math.round(value / 2) * 2);
}

export function scaleToShortEdge(size: FrameSize, shortEdge: number): FrameSize {
  const landscape = size.width >= size.height;
  const ratio = landscape ? size.width / size.height : size.height / size.width;
  const longEdge = toEven(shortEdge * ratio);
  const evenShort = toEven(shortEdge);
  return landscape
    ? { width: longEdge, height: evenShort }
    : { width: evenShort, height: longEdge };
}
