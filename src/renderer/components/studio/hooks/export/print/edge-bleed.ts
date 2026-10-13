const EDGE_STRIP_PX = 1;

interface BleedFrame {
  ctx: CanvasRenderingContext2D;
  source: HTMLCanvasElement;
  bleed: number;
  width: number;
  height: number;
}

const drawSideStrips = ({ ctx, source, bleed, width, height }: BleedFrame): void => {
  const strip = EDGE_STRIP_PX;
  ctx.drawImage(source, 0, 0, strip, height, 0, bleed, bleed, height);
  ctx.drawImage(source, width - strip, 0, strip, height, bleed + width, bleed, bleed, height);
  ctx.drawImage(source, 0, 0, width, strip, bleed, 0, width, bleed);
  ctx.drawImage(source, 0, height - strip, width, strip, bleed, bleed + height, width, bleed);
};

const drawCorners = ({ ctx, source, bleed, width, height }: BleedFrame): void => {
  const strip = EDGE_STRIP_PX;
  const right = width - strip;
  const bottom = height - strip;
  ctx.drawImage(source, 0, 0, strip, strip, 0, 0, bleed, bleed);
  ctx.drawImage(source, right, 0, strip, strip, bleed + width, 0, bleed, bleed);
  ctx.drawImage(source, 0, bottom, strip, strip, 0, bleed + height, bleed, bleed);
  ctx.drawImage(source, right, bottom, strip, strip, bleed + width, bleed + height, bleed, bleed);
};

export const extendCanvasBleed = (source: HTMLCanvasElement, bleed: number): HTMLCanvasElement => {
  const width = source.width;
  const height = source.height;
  const output = document.createElement("canvas");
  output.width = width + bleed * 2;
  output.height = height + bleed * 2;
  const ctx = output.getContext("2d");
  if (!ctx) throw new Error("Could not create a canvas for print bleed");
  ctx.imageSmoothingEnabled = false;
  const frame: BleedFrame = { ctx, source, bleed, width, height };
  drawSideStrips(frame);
  drawCorners(frame);
  ctx.drawImage(source, bleed, bleed);
  return output;
};
