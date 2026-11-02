import type { TemplateInsights } from "../template-detail-types";

const DEFAULT_EXPORT_SCALE = 1;

export function normalizeInsights(raw: Partial<TemplateInsights> | null | undefined): TemplateInsights | null {
  if (!raw) return null;
  return {
    fonts: raw.fonts ?? [],
    palette: raw.palette ?? [],
    background: raw.background ?? "",
    effects: raw.effects ?? [],
    textLayers: raw.textLayers ?? 0,
    imageLayers: raw.imageLayers ?? 0,
    shapeLayers: raw.shapeLayers ?? 0,
    textRoles: raw.textRoles ?? [],
    exportScale: raw.exportScale && raw.exportScale > 0 ? raw.exportScale : DEFAULT_EXPORT_SCALE,
  };
}
