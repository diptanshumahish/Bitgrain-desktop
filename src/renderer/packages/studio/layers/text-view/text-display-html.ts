import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { applyTransform } from "../text-style-utils";
import { buildParagraphHtml } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-html";
import { sanitizeRichHtml } from "@bitgrain/core/html-sanitize/sanitize-rich-html";

type DisplaySource = Pick<TextLayer, "content" | "richContent" | "textTransform" | "listStyles">;

export const rawDisplayHtml = (source: DisplaySource): string =>
  source.richContent ? sanitizeRichHtml(source.richContent) : applyTransform(source.content, source.textTransform);

export const displayHtml = (source: DisplaySource, paragraphMode: boolean): string =>
  paragraphMode ? buildParagraphHtml(rawDisplayHtml(source), source) : rawDisplayHtml(source);
