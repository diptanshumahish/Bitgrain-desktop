export interface SelectiveEffect {
  id: string;
  name: string;
  render: (source: CanvasImageSource, width: number, height: number, pixelScale?: number) => HTMLCanvasElement;
}

const PIXELATE_FACTOR = 0.04;
const BLUR_RADIUS_PX = 10;

type FilterBuilder = (pixelScale: number) => string;

const fixedFilter = (filter: string): FilterBuilder => () => filter;

function withFilter(buildFilter: FilterBuilder): SelectiveEffect["render"] {
  return (source, width, height, pixelScale = 1) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return canvas;
    ctx.filter = buildFilter(pixelScale);
    ctx.drawImage(source, 0, 0, width, height);
    ctx.filter = "none";
    return canvas;
  };
}

function renderPixelate(
  source: CanvasImageSource,
  width: number,
  height: number,
): HTMLCanvasElement {
  const smallWidth = Math.max(2, Math.round(width * PIXELATE_FACTOR));
  const smallHeight = Math.max(2, Math.round(height * PIXELATE_FACTOR));
  const small = document.createElement("canvas");
  small.width = smallWidth;
  small.height = smallHeight;
  small.getContext("2d")?.drawImage(source, 0, 0, smallWidth, smallHeight);

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(small, 0, 0, smallWidth, smallHeight, 0, 0, width, height);
  return canvas;
}

export const SELECTIVE_EFFECTS: SelectiveEffect[] = [
  { id: "blur", name: "Blur", render: withFilter((pixelScale) => `blur(${BLUR_RADIUS_PX * pixelScale}px)`) },
  { id: "grayscale", name: "Grayscale", render: withFilter(fixedFilter("grayscale(1)")) },
  { id: "invert", name: "Invert", render: withFilter(fixedFilter("invert(1)")) },
  { id: "brighten", name: "Brighten", render: withFilter(fixedFilter("brightness(1.6)")) },
  { id: "darken", name: "Darken", render: withFilter(fixedFilter("brightness(0.45)")) },
  { id: "saturate", name: "Saturate", render: withFilter(fixedFilter("saturate(2.4)")) },
  { id: "sepia", name: "Sepia", render: withFilter(fixedFilter("sepia(0.9)")) },
  { id: "pixelate", name: "Pixelate", render: renderPixelate },
];

export const getSelectiveEffect = (id: string): SelectiveEffect =>
  SELECTIVE_EFFECTS.find((effect) => effect.id === id) ?? SELECTIVE_EFFECTS[0];
