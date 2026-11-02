export type DrawContext = OffscreenCanvasRenderingContext2D;

export class Frame {
  readonly width: number;
  readonly height: number;
  readonly canvas: OffscreenCanvas;
  private readonly context2d: DrawContext;
  private cachedPixels: ImageData | null = null;
  private pixelsDirty = false;

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.canvas = new OffscreenCanvas(width, height);
    const context = this.canvas.getContext("2d");
    if (!context) throw new Error("2D canvas is not available");
    this.context2d = context;
  }

  get context(): DrawContext {
    this.commit();
    this.cachedPixels = null;
    return this.context2d;
  }

  pixels(): ImageData {
    if (!this.cachedPixels) this.cachedPixels = this.context2d.getImageData(0, 0, this.width, this.height);
    this.pixelsDirty = true;
    return this.cachedPixels;
  }

  writePixels(data: Uint8ClampedArray): void {
    this.pixels().data.set(data);
    this.commit();
  }

  readPixels(): Uint8ClampedArray {
    this.commit();
    return this.context2d.getImageData(0, 0, this.width, this.height).data;
  }

  commit(): void {
    if (!this.pixelsDirty || !this.cachedPixels) return;
    this.context2d.putImageData(this.cachedPixels, 0, 0);
    this.pixelsDirty = false;
  }
}

export const frameFromPixels = (data: Uint8ClampedArray, width: number, height: number): Frame => {
  const frame = new Frame(width, height);
  frame.writePixels(data);
  return frame;
};
