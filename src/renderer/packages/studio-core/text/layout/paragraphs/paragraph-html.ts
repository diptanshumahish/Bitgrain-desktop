import type { TextLayer } from "../../../model/studio-types";
import { buildListMarkers, paragraphListStyles } from "./list-markers";
import { splitParagraphs } from "./paragraph-split";

const LINE_PLACEHOLDER = "<br>";

const paragraphDiv = (inner: string, list: string, marker: string): string => {
  const listAttrs = list === "none" ? "" : ` data-list="${list}" data-marker="${marker}"`;
  return `<div data-para${listAttrs}>${inner || LINE_PLACEHOLDER}</div>`;
};

export const buildParagraphHtml = (html: string, layer: Pick<TextLayer, "listStyles">): string => {
  const paragraphs = splitParagraphs(html);
  const styles = paragraphListStyles(layer.listStyles, paragraphs.length);
  const markers = buildListMarkers(styles);
  return paragraphs.map((inner, index) => paragraphDiv(inner, styles[index], markers[index])).join("");
};

export const countParagraphs = (layer: Pick<TextLayer, "content" | "richContent">): number => {
  if (layer.richContent) return splitParagraphs(layer.richContent).length;
  return Math.max(1, layer.content.replaceAll("\\n", "\n").replace(/\n$/, "").split("\n").length);
};
