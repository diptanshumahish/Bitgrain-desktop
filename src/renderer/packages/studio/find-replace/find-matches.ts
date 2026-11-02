import type { Layer, TemplatePage, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { htmlToPlainText } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-serialize";

interface FindOptions {
  query: string;
  matchCase: boolean;
  wholeWord: boolean;
}

export interface TextMatch {
  pageId: string;
  layerId: string;
  start: number;
  end: number;
}

const WORD_CHAR = "[\\p{L}\\p{N}_]";

const escapeRegExp = (text: string): string => text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const buildFindPattern = (options: FindOptions): RegExp | null => {
  if (!options.query) return null;
  const core = escapeRegExp(options.query);
  const source = options.wholeWord ? `(?<!${WORD_CHAR})${core}(?!${WORD_CHAR})` : core;
  return new RegExp(source, options.matchCase ? "gu" : "giu");
};

export const searchableText = (layer: TextLayer): string =>
  layer.richContent ? htmlToPlainText(layer.richContent) : layer.content.replaceAll("\\n", "\n");

const collectTextLayers = (layers: Layer[]): TextLayer[] =>
  layers.flatMap((layer) => {
    const own = layer.type === "text" ? [layer] : [];
    const nested = "layers" in layer && Array.isArray(layer.layers) ? collectTextLayers(layer.layers) : [];
    return [...own, ...nested];
  });

const layerMatches = (layer: TextLayer, pattern: RegExp): Array<{ start: number; end: number }> =>
  Array.from(searchableText(layer).matchAll(pattern))
    .filter((match) => match[0].length > 0)
    .map((match) => ({ start: match.index ?? 0, end: (match.index ?? 0) + match[0].length }));

export const findMatches = (pages: TemplatePage[], options: FindOptions): TextMatch[] => {
  const pattern = buildFindPattern(options);
  if (!pattern) return [];
  return pages.flatMap((page) =>
    collectTextLayers(page.layers).flatMap((layer) =>
      layerMatches(layer, pattern).map((range) => ({ pageId: page.id, layerId: layer.id, ...range })),
    ),
  );
};
