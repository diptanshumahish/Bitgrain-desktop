import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { findAncestorGroupIds, findSelectedLayers } from "@bitgrain/studio-core/layers/studio-layers";
import { withPagePosition } from "../../../editor/layer-clipboard/absolute-position";
import { studioPagesSignal } from "../../../state/studio-document-store";
import { unionLayerBounds, type LayerBounds } from "@bitgrain/studio-core/geometry/layer-bounds";
import { studioSelectionSignal } from "./selection-store";

export interface ResolvedSelection {
  page: TemplatePage;
  layers: Layer[];
  bounds: LayerBounds;
}

const MIN_SIZE = 1;

const withoutNestedDuplicates = (pageLayers: Layer[], selected: Layer[], ids: string[]): Layer[] =>
  selected.filter((layer) => !(findAncestorGroupIds(pageLayers, layer.id) ?? []).some((ancestor) => ids.includes(ancestor)));

const containingPage = (pages: TemplatePage[], ids: string[], preferredId: string): TemplatePage | undefined => {
  const preferred = pages.find((page) => page.id === preferredId);
  if (preferred && findSelectedLayers(preferred.layers, ids).length > 0) return preferred;
  return pages.find((page) => findSelectedLayers(page.layers, ids).length > 0);
};

const resolveSelection = (ids: string[], pages: TemplatePage[], activePageId: string): ResolvedSelection | null => {
  if (ids.length === 0) return null;
  const page = containingPage(pages, ids, activePageId);
  if (!page) return null;
  const selected = withoutNestedDuplicates(page.layers, findSelectedLayers(page.layers, ids), ids)
    .filter((layer) => layer.visible)
    .map((layer) => withPagePosition(page.layers, layer));
  const bounds = unionLayerBounds(selected);
  if (!bounds || bounds.width < MIN_SIZE || bounds.height < MIN_SIZE) return null;
  return { page, layers: selected, bounds };
};

export const resolveCurrentSelection = (ids?: string[]): ResolvedSelection | null => {
  const selection = studioSelectionSignal.value;
  return resolveSelection(ids ?? selection.selectedIds, studioPagesSignal.value, selection.activePageId);
};
