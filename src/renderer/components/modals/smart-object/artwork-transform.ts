const QUARTER_TURN = Math.PI / 2;

const createCanvas = (width: number, height: number): { canvas: HTMLCanvasElement; context: CanvasRenderingContext2D | null } => {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return { canvas, context: canvas.getContext("2d") };
};

export const rotateArtworkQuarterTurn = (source: HTMLCanvasElement): HTMLCanvasElement => {
  const { canvas, context } = createCanvas(source.height, source.width);
  if (!context) return source;
  context.translate(canvas.width / 2, canvas.height / 2);
  context.rotate(QUARTER_TURN);
  context.drawImage(source, -source.width / 2, -source.height / 2);
  return canvas;
};

export const mirrorArtwork = (source: HTMLCanvasElement, horizontal: boolean): HTMLCanvasElement => {
  const { canvas, context } = createCanvas(source.width, source.height);
  if (!context) return source;
  context.translate(horizontal ? source.width : 0, horizontal ? 0 : source.height);
  context.scale(horizontal ? -1 : 1, horizontal ? 1 : -1);
  context.drawImage(source, 0, 0);
  return canvas;
};
