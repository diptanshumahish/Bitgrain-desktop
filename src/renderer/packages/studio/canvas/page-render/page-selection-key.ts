import type { TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import { findLayerById } from "@bitgrain/studio-core/layers/studio-layers";

const KEY_SEPARATOR = "\n";

export const NO_PAGE_SELECTION: string[] = [];

export const pageSelectionKey = (page: TemplatePage, selectedIds: string[]): string =>
  selectedIds.length === 0
    ? ""
    : selectedIds.filter((id) => Boolean(findLayerById(page.layers, id))).join(KEY_SEPARATOR);

export const idsFromSelectionKey = (key: string): string[] =>
  key === "" ? NO_PAGE_SELECTION : key.split(KEY_SEPARATOR);
