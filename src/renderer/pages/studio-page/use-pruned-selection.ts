import { useMemo } from "react";
import type { TemplatePage } from "../../data/studioTypes";
import { findLayerById } from "../../utils/studio-layers";

const existsInPages = (pages: TemplatePage[], id: string): boolean =>
  pages.some((page) => findLayerById(page.layers, id) !== null);

export const usePrunedSelection = (selectedIds: string[], pages: TemplatePage[]): string[] =>
  useMemo(() => {
    const kept = selectedIds.filter((id) => existsInPages(pages, id));
    return kept.length === selectedIds.length ? selectedIds : kept;
  }, [selectedIds, pages]);
