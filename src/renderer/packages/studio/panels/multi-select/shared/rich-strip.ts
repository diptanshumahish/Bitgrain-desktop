import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { stripPropFromHtml } from "@bitgrain/studio-core/text/rich-text/rich-text-apply";
import type { RichStyleProp } from "@bitgrain/studio-core/text/rich-text/rich-text-types";

export const richStripUpdate = (layer: TextLayer, prop: RichStyleProp): Partial<TextLayer> =>
  layer.richContent ? { richContent: stripPropFromHtml(layer.richContent, prop) } : {};
