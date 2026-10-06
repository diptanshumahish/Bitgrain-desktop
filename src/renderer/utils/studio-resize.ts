import type { Layer, TextLayer, TemplatePage } from "../data/studioTypes";

export interface ResizeFormat {
  id: string;
  label: string;
  width: number;
  height: number;
}

// Deterministic target sizes. No AI, just predictable reflow into each aspect ratio.
export const RESIZE_FORMATS: ResizeFormat[] = [
  { id: "square", label: "square post", width: 1080, height: 1080 },
  { id: "story", label: "story / reel", width: 1080, height: 1920 },
  { id: "landscape", label: "landscape", width: 1920, height: 1080 },
  { id: "cover", label: "album cover", width: 3000, height: 3000 },
  { id: "banner", label: "wide banner", width: 1500, height: 500 },
  { id: "print", label: "a4 print", width: 2480, height: 3508 },
];

const FULL_BLEED_COVERAGE = 0.96;
const EDGE_TOLERANCE = 0.02;

const newId = (): string => crypto.randomUUID();

const isFullBleed = (layer: Layer, srcW: number, srcH: number): boolean =>
  layer.x <= srcW * EDGE_TOLERANCE &&
  layer.y <= srcH * EDGE_TOLERANCE &&
  layer.width >= srcW * FULL_BLEED_COVERAGE &&
  layer.height >= srcH * FULL_BLEED_COVERAGE;

const scaleGroupChild = (child: Layer, scale: number): Layer => {
  const scaled = {
    ...child,
    id: newId(),
    x: child.x * scale,
    y: child.y * scale,
    width: child.width * scale,
    height: child.height * scale,
  };
  if (child.type === "text") {
    const text = child as TextLayer;
    return { ...scaled, fontSize: text.fontSize * scale, letterSpacing: text.letterSpacing * scale } as Layer;
  }
  return scaled;
};

// reflowLayer keeps each element's relative center and scales it uniformly. Full-bleed
// backgrounds stretch to cover the new canvas instead of reflowing.
const reflowLayer = (layer: Layer, srcW: number, srcH: number, dstW: number, dstH: number, scale: number): Layer => {
  if (isFullBleed(layer, srcW, srcH)) {
    return { ...layer, id: newId(), x: 0, y: 0, width: dstW, height: dstH };
  }

  const relCenterX = (layer.x + layer.width / 2) / srcW;
  const relCenterY = (layer.y + layer.height / 2) / srcH;
  const width = layer.width * scale;
  const height = layer.height * scale;

  const base: Layer = {
    ...layer,
    id: newId(),
    width,
    height,
    x: relCenterX * dstW - width / 2,
    y: relCenterY * dstH - height / 2,
  };

  if (layer.type === "text") {
    const text = layer as TextLayer;
    return { ...base, fontSize: text.fontSize * scale, letterSpacing: text.letterSpacing * scale } as Layer;
  }
  if (layer.type === "group" || layer.type === "frame") {
    return { ...base, layers: layer.layers.map((child) => scaleGroupChild(child, scale)) } as Layer;
  }
  return base;
};

export const reflowLayers = (layers: Layer[], srcW: number, srcH: number, dstW: number, dstH: number): Layer[] => {
  if (srcW <= 0 || srcH <= 0) return layers;
  const scale = Math.min(dstW / srcW, dstH / srcH);
  return layers.map((layer) => reflowLayer(layer, srcW, srcH, dstW, dstH, scale));
};

export const buildResizedPage = (source: TemplatePage, format: ResizeFormat, x: number, y: number): TemplatePage => ({
  id: newId(),
  name: format.label,
  layers: reflowLayers(source.layers, source.width, source.height, format.width, format.height),
  background: source.background,
  backgroundVar: source.backgroundVar,
  x,
  y,
  width: format.width,
  height: format.height,
  image: source.image,
});
