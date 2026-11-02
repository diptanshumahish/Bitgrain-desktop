export interface FittedCanvas {
  context: CanvasRenderingContext2D;
  width: number;
  height: number;
}

export const fitCanvas = (canvas: HTMLCanvasElement): FittedCanvas | null => {
  const rect = canvas.getBoundingClientRect();
  const context = canvas.getContext("2d");
  if (!context || rect.width === 0 || rect.height === 0) return null;
  const ratio = window.devicePixelRatio || 1;
  canvas.width = Math.round(rect.width * ratio);
  canvas.height = Math.round(rect.height * ratio);
  context.setTransform(ratio, 0, 0, ratio, 0, 0);
  return { context, width: rect.width, height: rect.height };
};
