import type {
  Layer,
  TemplateDef,
  TemplatePage,
  TemplatePageInput,
} from "../model/studio-types";
import { pickSampleImage } from "./sample-images";
import { sanitizeLayerTree } from "@bitgrain/core/html-sanitize/sanitize-text-layers";

const PAGE_GAP = 80;

export const makePageId = (index: number): string => `page-${index}`;

const makeUniquePageId = (): string => `page-${crypto.randomUUID()}`;

export const nextPageX = (pages: TemplatePage[]): number =>
  pages.length === 0 ? 0 : Math.max(...pages.map((page) => page.x + page.width)) + PAGE_GAP;

const fillEmptyImageSlots = (
  layers: Layer[],
  defaultImage: string | null,
  templateId: string,
): Layer[] =>
  layers.map((layer) => {
    if (layer.type === "group" || layer.type === "frame") {
      return { ...layer, layers: fillEmptyImageSlots(layer.layers, defaultImage, templateId) };
    }
    if ((layer.type === "image" || layer.type === "upload") && !layer.src) {
      return { ...layer, src: defaultImage ?? pickSampleImage(templateId, layer.id) };
    }
    return layer;
  });

const makeFreshLayerId = (type: string): string =>
  `${type}-${Date.now()}-${Math.random().toString(36).slice(2)}`;

const reassignLayerIds = (layers: Layer[]): Layer[] =>
  layers.map((layer) => {
    if (layer.type === "group" || layer.type === "frame") {
      return {
        ...layer,
        id: makeFreshLayerId(layer.type),
        layers: reassignLayerIds(layer.layers),
      };
    }
    return { ...layer, id: makeFreshLayerId(layer.type) };
  });

const cloneLayers = (layers: Layer[]): Layer[] =>
  sanitizeLayerTree(layers.map((layer) => structuredClone(layer)));

export const cloneLayersWithFreshIds = (layers: Layer[]): Layer[] =>
  reassignLayerIds(cloneLayers(layers));

const clonePage = (page: TemplatePage): TemplatePage => ({
  ...page,
  layers: cloneLayersWithFreshIds(page.layers),
  animation: page.animation ? structuredClone(page.animation) : undefined,
});

export const makeBlankPage = (
  background: string,
  pageNumber: number,
  width: number,
  height: number,
  x: number,
  y: number,
): TemplatePage => ({
  id: makeUniquePageId(),
  name: `Page ${pageNumber}`,
  layers: [],
  background,
  x,
  y,
  width,
  height,
  image: null,
});

export const duplicatePage = (source: TemplatePage, x: number): TemplatePage => ({
  ...clonePage(source),
  id: makeUniquePageId(),
  name: `${source.name} copy`,
  x,
});

const pageFromInput = (
  input: TemplatePageInput,
  index: number,
  fallbackWidth: number,
  fallbackHeight: number,
  fallbackBackground: string,
  shouldReassignIds: boolean,
  templateId: string,
): TemplatePage => {
  const width = input.width ?? fallbackWidth;
  const height = input.height ?? fallbackHeight;
  const image = input.image ?? null;
  const cloned = shouldReassignIds
    ? cloneLayersWithFreshIds(input.layers)
    : cloneLayers(input.layers);
  return {
    id: input.id || makePageId(index + 1),
    name: input.name || `Page ${index + 1}`,
    layers: fillEmptyImageSlots(cloned, image, templateId),
    background: input.background ?? fallbackBackground,
    x: input.x ?? index * (width + PAGE_GAP),
    y: input.y ?? 0,
    width,
    height,
    image,
    animation: input.animation ? structuredClone(input.animation) : undefined,
    guides: input.guides,
    layoutGrids: input.layoutGrids,
    safeZones: input.safeZones,
    notes: input.notes,
  };
};

export const getTemplatePages = (template: TemplateDef): TemplatePage[] => {
  if (template.pages && template.pages.length > 0) {
    const reassignAcrossPages = template.pages.length > 1;
    return template.pages.map((page, index) =>
      pageFromInput(
        page,
        index,
        template.width,
        template.height,
        template.background,
        reassignAcrossPages,
        template.id,
      ),
    );
  }
  return [
    {
      id: makePageId(1),
      name: "Page 1",
      layers: fillEmptyImageSlots(cloneLayers(template.layers), template.image ?? null, template.id),
      background: template.background,
      x: 0,
      y: 0,
      width: template.width,
      height: template.height,
      image: template.image ?? null,
    },
  ];
};
