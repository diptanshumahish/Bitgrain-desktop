import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { TextStyleVariable } from "@bitgrain/studio-core/model/design-kit-types";
import { legacyPaintOverride } from "@bitgrain/studio-core/shape-render/paint-list/legacy-override";
import { mapPagesLayersDeep } from "../linking/map-layers-deep";
import { keepAlphaOf } from "../palette/kit-color-space";
import { withKitFont } from "../palette/kit-font-update";
import type { BrandIssue } from "./brand-issue";

const readString = (layer: Layer, field: string): string =>
  String((layer as unknown as Record<string, unknown>)[field] ?? "");

const fixColors = (layer: Layer, fixes: BrandIssue[]): Layer => {
  const patch: Record<string, string> = {};
  for (const fix of fixes) {
    if (fix.kind !== "color") continue;
    patch[fix.field] = keepAlphaOf(readString(layer, fix.field), fix.fixValue);
    if (fix.varField) patch[fix.varField] = fix.fixId;
  }
  return Object.keys(patch).length > 0 ? ({ ...layer, ...legacyPaintOverride(patch) } as Layer) : layer;
};

const fixFont = (layer: Layer, fixes: BrandIssue[], styles: TextStyleVariable[]): Layer => {
  const fontFix = fixes.find((fix) => fix.kind === "font");
  const style = fontFix ? styles.find((entry) => entry.id === fontFix.fixId) : undefined;
  return style && layer.type === "text" ? withKitFont(layer, style) : layer;
};

const fixBackground = (page: TemplatePage, fixes: BrandIssue[]): TemplatePage => {
  const fix = fixes.find((issue) => issue.layerId === null);
  return fix ? { ...page, background: keepAlphaOf(page.background, fix.fixValue), backgroundVar: fix.fixId } : page;
};

const groupByLayer = (fixes: BrandIssue[]): Map<string, BrandIssue[]> => {
  const grouped = new Map<string, BrandIssue[]>();
  for (const fix of fixes) {
    if (fix.layerId) grouped.set(fix.layerId, [...(grouped.get(fix.layerId) ?? []), fix]);
  }
  return grouped;
};

const fixPage = (page: TemplatePage, fixes: BrandIssue[], styles: TextStyleVariable[]): TemplatePage => {
  const byLayer = groupByLayer(fixes);
  const [fixed] = mapPagesLayersDeep([fixBackground(page, fixes)], (layer) => {
    const layerFixes = byLayer.get(layer.id);
    return layerFixes ? fixFont(fixColors(layer, layerFixes), layerFixes, styles) : layer;
  });
  return fixed;
};

export const fixBrandIssues = (pages: TemplatePage[], issues: BrandIssue[], styles: TextStyleVariable[]): TemplatePage[] =>
  pages.map((page) => {
    const pageFixes = issues.filter((issue) => issue.pageId === page.id);
    return pageFixes.length > 0 ? fixPage(page, pageFixes, styles) : page;
  });
