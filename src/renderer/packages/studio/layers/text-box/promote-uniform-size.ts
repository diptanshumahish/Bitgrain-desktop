import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { layerBaseStyle, resolveHtmlStyle } from "@bitgrain/studio-core/text/rich-text/rich-text-read";
import { stripPropFromHtml } from "@bitgrain/studio-core/text/rich-text/rich-text-apply";

export const promoteUniformFontSize = (layer: TextLayer, richContent: string): Partial<TextLayer> => {
  if (!richContent) return {};
  const size = resolveHtmlStyle(richContent, layerBaseStyle(layer)).fontSize;
  const uniformSize = size.distinct.length === 1 ? size.value : null;
  if (uniformSize === null || uniformSize === Math.round(layer.fontSize)) return {};
  return { fontSize: uniformSize, richContent: stripPropFromHtml(richContent, "fontSize") };
};
