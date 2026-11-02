export interface GrainParticle {
  x: number;
  y: number;
  color: string;
  driftX: number;
  driftY: number;
  wobble: number;
  delay: number;
}

const GRAIN_STEP = 2;
const SWEEP_SHARE = 0.5;
const DELAY_JITTER = 0.16;
const TRANSPARENT = "rgba(0, 0, 0, 0)";

const paintTextNodes = (context: CanvasRenderingContext2D, element: HTMLElement, origin: DOMRect): void => {
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode(); node; node = walker.nextNode()) {
    const parent = node.parentElement;
    const text = node.textContent?.trim();
    if (!parent || !text) continue;
    const range = document.createRange();
    range.selectNodeContents(node);
    const box = range.getBoundingClientRect();
    const style = getComputedStyle(parent);
    context.font = `${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
    context.fillStyle = style.color;
    context.textBaseline = "middle";
    context.fillText(text, box.left - origin.left, box.top - origin.top + box.height / 2);
  }
};

const paintSnapshot = (element: HTMLElement, rect: DOMRect): CanvasRenderingContext2D | null => {
  const scratch = document.createElement("canvas");
  scratch.width = Math.ceil(rect.width);
  scratch.height = Math.ceil(rect.height);
  const context = scratch.getContext("2d", { willReadFrequently: true });
  if (!context) return null;
  const background = getComputedStyle(element).backgroundColor;
  if (background !== TRANSPARENT) {
    context.fillStyle = background;
    context.fillRect(0, 0, scratch.width, scratch.height);
  }
  paintTextNodes(context, element, rect);
  return context;
};

const toParticle = (x: number, y: number, width: number, pixels: Uint8ClampedArray, index: number): GrainParticle => ({
  x,
  y,
  color: `rgba(${pixels[index]},${pixels[index + 1]},${pixels[index + 2]},${pixels[index + 3] / 255})`,
  driftX: 0.5 + Math.random() * 2.2,
  driftY: -0.3 - Math.random() * 1.4,
  wobble: Math.random() * Math.PI * 2,
  delay: (x / width) * SWEEP_SHARE + Math.random() * DELAY_JITTER,
});

export const sampleElementGrain = (element: HTMLElement, rect: DOMRect): GrainParticle[] => {
  const context = paintSnapshot(element, rect);
  if (!context) return [];
  const { width, height } = context.canvas;
  const pixels = context.getImageData(0, 0, width, height).data;
  const particles: GrainParticle[] = [];
  for (let y = 0; y < height; y += GRAIN_STEP) {
    for (let x = 0; x < width; x += GRAIN_STEP) {
      const index = (y * width + x) * 4;
      if (pixels[index + 3] > 0) particles.push(toParticle(x, y, width, pixels, index));
    }
  }
  return particles;
};
