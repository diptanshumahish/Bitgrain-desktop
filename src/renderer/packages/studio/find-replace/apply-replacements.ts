import type { Layer, TemplatePage, TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { updateLayersRecursively } from "@bitgrain/studio-core/layers/studio-layers";
import { refitTextLayer } from "../layers/text-box/text-box-fit";
import { htmlToPlainText } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-serialize";
import { searchableText } from "./find-matches";
import type { TextMatch } from "./find-matches";
import { replacePlainRanges, replaceRichRanges, type TextRange } from "./replace-rich-text";

const replacedText = (layer: TextLayer, ranges: TextRange[], replacement: string): Partial<TextLayer> => {
  if (!layer.richContent) return { content: replacePlainRanges(searchableText(layer), ranges, replacement) };
  const richContent = replaceRichRanges(layer.richContent, ranges, replacement);
  return { richContent, content: htmlToPlainText(richContent) };
};

const groupByLayer = (matches: TextMatch[]): Map<string, TextMatch[]> =>
  matches.reduce((groups, match) => {
    const key = `${match.pageId}:${match.layerId}`;
    groups.set(key, [...(groups.get(key) ?? []), match]);
    return groups;
  }, new Map<string, TextMatch[]>());

const replaceInPage = (page: TemplatePage, layerId: string, ranges: TextRange[], replacement: string): TemplatePage => ({
  ...page,
  layers: updateLayersRecursively(page.layers, [layerId], (layer: Layer) => {
    if (layer.type !== "text") return {};
    return refitTextLayer(layer, replacedText(layer, ranges, replacement), page.width);
  }),
});

export const applyReplacements = (pages: TemplatePage[], matches: TextMatch[], replacement: string): TemplatePage[] =>
  [...groupByLayer(matches).values()].reduce((current, group) => {
    const { pageId, layerId } = group[0];
    return current.map((page) => (page.id === pageId ? replaceInPage(page, layerId, group, replacement) : page));
  }, pages);
