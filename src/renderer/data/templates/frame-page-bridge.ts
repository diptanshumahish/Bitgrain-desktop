import type { FrameLayer, TemplatePage } from "../studioTypes";

export const makeFrameId = (): string =>
  `frame-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const pageToFrameLayer = (page: TemplatePage): FrameLayer => ({
  id: page.id,
  type: "frame",
  name: page.name,
  x: page.x,
  y: page.y,
  width: page.width,
  height: page.height,
  opacity: 1,
  locked: false,
  visible: true,
  layers: page.layers,
  background: page.background,
  backgroundVar: page.backgroundVar,
  clip: page.clip ?? true,
  image: page.image ?? null,
});

export const frameLayerToPage = (
  frame: FrameLayer,
  x: number,
  y: number,
): TemplatePage => ({
  id: frame.id,
  name: frame.name,
  layers: frame.layers,
  background: frame.background,
  backgroundVar: frame.backgroundVar,
  x,
  y,
  width: frame.width,
  height: frame.height,
  image: frame.image ?? null,
  clip: frame.clip,
});
