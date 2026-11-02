import { createCanvas } from "../../../../engine/selective/brush-canvas";

export interface MaskedComposeInput {
  target: HTMLCanvasElement;
  effect: CanvasImageSource;
  base: CanvasImageSource;
  maskCanvas: HTMLCanvasElement;
  effectSmoothing: boolean;
}

export const cloneCanvas = (source: HTMLCanvasElement): HTMLCanvasElement => {
  const copy = createCanvas(source.width, source.height);
  copy.getContext("2d")?.drawImage(source, 0, 0);
  return copy;
};

export const composeMaskedEffect = (input: MaskedComposeInput): void => {
  const { target, effect, base, maskCanvas, effectSmoothing } = input;
  const { width, height } = target;
  const layer = createCanvas(width, height);
  const layerCtx = layer.getContext("2d");
  const targetCtx = target.getContext("2d");
  if (!layerCtx || !targetCtx) return;

  layerCtx.imageSmoothingEnabled = effectSmoothing;
  layerCtx.drawImage(effect, 0, 0, width, height);
  layerCtx.imageSmoothingEnabled = true;
  layerCtx.globalCompositeOperation = "destination-in";
  layerCtx.drawImage(maskCanvas, 0, 0, width, height);

  targetCtx.save();
  targetCtx.globalCompositeOperation = "source-over";
  targetCtx.clearRect(0, 0, width, height);
  targetCtx.imageSmoothingEnabled = true;
  targetCtx.drawImage(base, 0, 0, width, height);
  targetCtx.drawImage(layer, 0, 0);
  targetCtx.restore();
};
