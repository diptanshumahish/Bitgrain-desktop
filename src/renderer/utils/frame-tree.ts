import type { FrameLayer, Layer, TemplatePage } from "../data/studioTypes";
import { isContainerLayer, type ContainerLayer } from "./studio-layers";
import { frameLayerToPage, pageToFrameLayer } from "../data/templates/frame-page-bridge";

export interface Rect {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface NodeLocation {
  page: TemplatePage;
  ancestors: ContainerLayer[];
  layer: Layer | null;
}

interface DropTarget {
  targetId: string | null;
  isRoot: boolean;
}

interface ReparentResult {
  pages: TemplatePage[];
  promotedPageId?: string;
  demotedFromPageId?: string;
}

const searchLayers = (
  layers: Layer[],
  id: string,
  ancestors: ContainerLayer[],
): { ancestors: ContainerLayer[]; layer: Layer } | null => {
  for (const layer of layers) {
    if (layer.id === id) return { ancestors, layer };
    if (isContainerLayer(layer)) {
      const found = searchLayers(layer.layers, id, [...ancestors, layer]);
      if (found) return found;
    }
  }
  return null;
};

export const locateNode = (
  pages: TemplatePage[],
  id: string,
): NodeLocation | null => {
  for (const page of pages) {
    if (page.id === id) return { page, ancestors: [], layer: null };
    const found = searchLayers(page.layers, id, []);
    if (found) return { page, ancestors: found.ancestors, layer: found.layer };
  }
  return null;
};

export const computeAbsoluteRect = (
  pages: TemplatePage[],
  id: string,
): Rect | null => {
  const location = locateNode(pages, id);
  if (!location) return null;
  let x = location.page.x;
  let y = location.page.y;
  for (const ancestor of location.ancestors) {
    x += ancestor.x;
    y += ancestor.y;
  }
  if (location.layer) {
    x += location.layer.x;
    y += location.layer.y;
  }
  const width = location.layer ? location.layer.width : location.page.width;
  const height = location.layer ? location.layer.height : location.page.height;
  return { x, y, width, height };
};

export const computeContentOrigin = (
  pages: TemplatePage[],
  containerId: string,
): { x: number; y: number } | null => {
  const rect = computeAbsoluteRect(pages, containerId);
  return rect ? { x: rect.x, y: rect.y } : null;
};

export const findParentContainerId = (
  pages: TemplatePage[],
  childId: string,
): string | null => {
  const location = locateNode(pages, childId);
  if (!location || !location.layer) return null;
  if (location.ancestors.length === 0) return location.page.id;
  return location.ancestors[location.ancestors.length - 1].id;
};

export const isDescendant = (
  pages: TemplatePage[],
  ancestorId: string,
  maybeDescendantId: string,
): boolean => {
  const location = locateNode(pages, maybeDescendantId);
  if (!location || !location.layer) return false;
  if (ancestorId === location.page.id) return true;
  return location.ancestors.some((ancestor) => ancestor.id === ancestorId);
};

export const removeLayerById = (
  layers: Layer[],
  id: string,
): { layers: Layer[]; removed: Layer | null } => {
  let removed: Layer | null = null;
  const next: Layer[] = [];
  for (const layer of layers) {
    if (layer.id === id) {
      removed = layer;
      continue;
    }
    if (isContainerLayer(layer)) {
      const result = removeLayerById(layer.layers, id);
      if (result.removed) {
        removed = result.removed;
        next.push({ ...layer, layers: result.layers } as ContainerLayer);
        continue;
      }
    }
    next.push(layer);
  }
  return { layers: next, removed };
};

export const insertLayerIntoContainer = (
  layers: Layer[],
  containerId: string,
  child: Layer,
  index?: number,
): Layer[] =>
  layers.map((layer) => {
    if (layer.id === containerId && isContainerLayer(layer)) {
      const nextChildren = [...layer.layers];
      if (index === undefined || index < 0 || index > nextChildren.length) {
        nextChildren.push(child);
      } else {
        nextChildren.splice(index, 0, child);
      }
      return { ...layer, layers: nextChildren } as ContainerLayer;
    }
    if (isContainerLayer(layer)) {
      return {
        ...layer,
        layers: insertLayerIntoContainer(layer.layers, containerId, child, index),
      } as ContainerLayer;
    }
    return layer;
  });

export const insertLayerIntoTarget = (
  pages: TemplatePage[],
  targetId: string,
  child: Layer,
): TemplatePage[] =>
  pages.map((page) => {
    if (page.id === targetId) return { ...page, layers: [...page.layers, child] };
    return { ...page, layers: insertLayerIntoContainer(page.layers, targetId, child) };
  });

export const updateContainerLayers = (
  pages: TemplatePage[],
  containerId: string,
  updater: (prev: Layer[]) => Layer[],
): TemplatePage[] =>
  pages.map((page) => {
    if (page.id === containerId) return { ...page, layers: updater(page.layers) };
    return {
      ...page,
      layers: updateNestedContainerLayers(page.layers, containerId, updater),
    };
  });

const updateNestedContainerLayers = (
  layers: Layer[],
  containerId: string,
  updater: (prev: Layer[]) => Layer[],
): Layer[] =>
  layers.map((layer) => {
    if (layer.id === containerId && isContainerLayer(layer)) {
      return { ...layer, layers: updater(layer.layers) } as ContainerLayer;
    }
    if (isContainerLayer(layer)) {
      return {
        ...layer,
        layers: updateNestedContainerLayers(layer.layers, containerId, updater),
      } as ContainerLayer;
    }
    return layer;
  });

const pointInRect = (x: number, y: number, rect: Rect): boolean =>
  x >= rect.x && x <= rect.x + rect.width && y >= rect.y && y <= rect.y + rect.height;

export const findDropTargetFrame = (
  pages: TemplatePage[],
  canvasX: number,
  canvasY: number,
  opts: { excludeId?: string } = {},
): DropTarget => {
  const excludeId = opts.excludeId;
  const state: { best: { id: string; depth: number; isRoot: boolean } | null } = {
    best: null,
  };

  const consider = (id: string, rect: Rect, depth: number, isRoot: boolean) => {
    if (!pointInRect(canvasX, canvasY, rect)) return;
    if (!state.best || depth > state.best.depth) state.best = { id, depth, isRoot };
  };

  const walk = (layers: Layer[], originX: number, originY: number, depth: number) => {
    for (const layer of layers) {
      if (!isContainerLayer(layer) || layer.id === excludeId) continue;
      const absX = originX + layer.x;
      const absY = originY + layer.y;
      if (layer.type === "frame") {
        consider(layer.id, { x: absX, y: absY, width: layer.width, height: layer.height }, depth, false);
      }
      walk(layer.layers, absX, absY, depth + 1);
    }
  };

  for (const page of pages) {
    if (page.id === excludeId) continue;
    consider(page.id, { x: page.x, y: page.y, width: page.width, height: page.height }, 0, true);
    walk(page.layers, page.x, page.y, 1);
  }

  if (!state.best) return { targetId: null, isRoot: true };
  return { targetId: state.best.id, isRoot: state.best.isRoot };
};

export const reparentLayer = (
  pages: TemplatePage[],
  layerId: string,
  newParentId: string | null,
  dropLocal?: { x: number; y: number },
): ReparentResult => {
  const location = locateNode(pages, layerId);
  const absRect = computeAbsoluteRect(pages, layerId);
  if (!location || !absRect) return { pages };

  if (newParentId === null) {
    if (!location.layer) return { pages };
    if (location.layer.type !== "frame") return { pages };
    const frame = location.layer as FrameLayer;
    const stripped = pages.map((page) =>
      page.id === location.page.id
        ? { ...page, layers: removeLayerById(page.layers, layerId).layers }
        : page,
    );
    const newPage = frameLayerToPage(frame, absRect.x, absRect.y);
    return { pages: [...stripped, newPage], promotedPageId: newPage.id };
  }

  if (newParentId === layerId) return { pages };
  if (isDescendant(pages, layerId, newParentId)) return { pages };

  const targetOrigin = computeContentOrigin(pages, newParentId);
  if (!targetOrigin) return { pages };
  const localX = Math.round(dropLocal ? dropLocal.x : absRect.x - targetOrigin.x);
  const localY = Math.round(dropLocal ? dropLocal.y : absRect.y - targetOrigin.y);

  if (!location.layer) {
    const frame = pageToFrameLayer(location.page);
    const node: FrameLayer = { ...frame, x: localX, y: localY };
    const stripped = pages.filter((page) => page.id !== location.page.id);
    return {
      pages: insertLayerIntoTarget(stripped, newParentId, node),
      demotedFromPageId: location.page.id,
    };
  }

  const node = { ...location.layer, x: localX, y: localY } as Layer;
  const stripped = pages.map((page) =>
    page.id === location.page.id
      ? { ...page, layers: removeLayerById(page.layers, layerId).layers }
      : page,
  );
  return { pages: insertLayerIntoTarget(stripped, newParentId, node) };
};
