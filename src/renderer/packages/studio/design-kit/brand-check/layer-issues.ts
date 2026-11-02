import type { Layer, TemplatePage } from "@bitgrain/studio-core/model/studio-types";
import type { DesignKit } from "@bitgrain/studio-core/model/design-kit-types";
import { colorKey, isSolidColor } from "../palette/kit-color-space";
import { fontFamilyKey } from "../palette/font-family-key";
import { layerColorUses } from "../palette/layer-colors";
import { nearestKitColor, nearestTextStyle } from "../palette/nearest-kit-token";
import type { BrandIssue } from "./brand-issue";

const PAGE_BACKGROUND_LABEL = "Page background";

export interface KitVocabulary {
  kit: DesignKit;
  colorKeys: ReadonlySet<string>;
  fontKeys: ReadonlySet<string>;
}

export const kitVocabulary = (kit: DesignKit): KitVocabulary => ({
  kit,
  colorKeys: new Set(kit.colors.filter((color) => isSolidColor(color.value)).map((color) => colorKey(color.value))),
  fontKeys: new Set(kit.textStyles.map((style) => fontFamilyKey(style.fontFamily))),
});

interface IssueTarget {
  pageId: string;
  layerId: string | null;
  label: string;
}

const colorIssue = (target: IssueTarget, field: string, varField: string, value: string, vocab: KitVocabulary): BrandIssue[] => {
  if (vocab.colorKeys.has(colorKey(value))) return [];
  const nearest = nearestKitColor(value, vocab.kit.colors);
  if (!nearest) return [];
  const key = `${target.pageId}:${target.layerId ?? "page"}:${field}`;
  return [{ ...target, key, kind: "color", field, varField, value, fixValue: nearest.value, fixId: nearest.id }];
};

const fontIssue = (target: IssueTarget, layer: Layer, vocab: KitVocabulary): BrandIssue[] => {
  if (layer.type !== "text" || vocab.fontKeys.has(fontFamilyKey(layer.fontFamily))) return [];
  const nearest = nearestTextStyle(layer.fontSize, vocab.kit.textStyles);
  if (!nearest) return [];
  const key = `${target.pageId}:${layer.id}:fontFamily`;
  return [{
    ...target, key, kind: "font", field: "fontFamily", varField: null,
    value: layer.fontFamily, fixValue: nearest.fontFamily, fixId: nearest.id,
  }];
};

export const layerIssues = (pageId: string, layer: Layer, vocab: KitVocabulary): BrandIssue[] => {
  const target: IssueTarget = { pageId, layerId: layer.id, label: layer.name || layer.type };
  const colors = layerColorUses(layer).flatMap((use) => colorIssue(target, use.colorField, use.varField, use.value, vocab));
  return [...colors, ...fontIssue(target, layer, vocab)];
};

export const pageBackgroundIssues = (page: TemplatePage, vocab: KitVocabulary): BrandIssue[] => {
  if (!isSolidColor(page.background)) return [];
  const target: IssueTarget = { pageId: page.id, layerId: null, label: PAGE_BACKGROUND_LABEL };
  return colorIssue(target, "background", "backgroundVar", page.background, vocab);
};
