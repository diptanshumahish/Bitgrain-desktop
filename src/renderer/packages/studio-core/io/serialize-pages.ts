import type { Layer, TemplatePage } from "../model/studio-types";
import type { WorkPage } from "../model/work";
import { makePageId } from "../templates/template-pages";
import { sanitizeLayerTree } from "@bitgrain/core/html-sanitize/sanitize-text-layers";

export function serializePages(pages: TemplatePage[]): WorkPage[] {
  return pages.map((page) => ({
    id: page.id,
    name: page.name,
    layers: page.layers,
    background: page.background,
    backgroundVar: page.backgroundVar,
    x: page.x,
    y: page.y,
    width: page.width,
    height: page.height,
    image: page.image ?? null,
    clip: page.clip,
    animation: page.animation,
    guides: page.guides,
    layoutGrids: page.layoutGrids,
    safeZones: page.safeZones,
    notes: page.notes,
  }));
}

interface PageFallback {
  layers: Layer[];
  background: string;
  width: number;
  height: number;
}

const normalizePage = (page: unknown, index: number, fallback: PageFallback): TemplatePage => {
  const source = page as Partial<TemplatePage>;
  return {
    id: source.id ?? makePageId(index + 1),
    name: source.name ?? `Page ${index + 1}`,
    layers: Array.isArray(source.layers) ? sanitizeLayerTree(source.layers as Layer[]) : [],
    background: source.background ?? fallback.background,
    backgroundVar: source.backgroundVar,
    x: source.x ?? 0,
    y: source.y ?? 0,
    width: source.width ?? fallback.width,
    height: source.height ?? fallback.height,
    image: source.image ?? null,
    clip: source.clip,
    animation: source.animation,
    guides: source.guides,
    layoutGrids: source.layoutGrids,
    safeZones: source.safeZones,
    notes: typeof source.notes === "string" ? source.notes : undefined,
  };
};

export function normalizePages(rawPages: unknown, fallback: PageFallback): TemplatePage[] {
  if (Array.isArray(rawPages) && rawPages.length > 0) {
    return rawPages.map((page, index) => normalizePage(page, index, fallback));
  }
  return [
    {
      id: makePageId(1),
      name: "Page 1",
      layers: sanitizeLayerTree(fallback.layers),
      background: fallback.background,
      x: 0,
      y: 0,
      width: fallback.width,
      height: fallback.height,
    },
  ];
}
