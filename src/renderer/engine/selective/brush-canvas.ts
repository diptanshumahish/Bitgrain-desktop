const BRUSH_CORE_RATIO = 0.4;

export const createCanvas = (width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
};

export const stampBrush = (ctx: CanvasRenderingContext2D, x: number, y: number, radius: number): void => {
  const gradient = ctx.createRadialGradient(x, y, radius * BRUSH_CORE_RATIO, x, y, radius);
  gradient.addColorStop(0, "rgba(255,255,255,1)");
  gradient.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = gradient;
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fill();
};
