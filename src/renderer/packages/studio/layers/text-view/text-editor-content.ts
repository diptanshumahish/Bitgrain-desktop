import type { TextLayer } from "@bitgrain/studio-core/model/studio-types";
import { normalizeText } from "../text-style-utils";
import { cleanRichHtml, stripZeroWidth } from "@bitgrain/studio-core/text/rich-text/rich-text-apply";
import { usesParagraphMode } from "@bitgrain/studio-core/text/layout/text-layout-flags";
import { buildParagraphHtml } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-html";
import { plainTextToHtml } from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-split";
import { queueTextExtras } from "@bitgrain/studio-core/text/layout/text-extras-queue";
import { sanitizeRichHtml } from "@bitgrain/core/html-sanitize/sanitize-rich-html";
import {
  hasParagraphBlocks,
  htmlToPlainText,
  serializeParagraphEditor,
} from "@bitgrain/studio-core/text/layout/paragraphs/paragraph-serialize";

interface EditorContent {
  content: string;
  richContent: string;
}

export const fillEditor = (editor: HTMLDivElement, layer: TextLayer): void => {
  if (usesParagraphMode(layer)) {
    editor.innerHTML = sanitizeRichHtml(buildParagraphHtml(layer.richContent || plainTextToHtml(layer.content), layer));
    return;
  }
  if (layer.richContent) editor.innerHTML = sanitizeRichHtml(layer.richContent);
  else editor.innerText = layer.content;
};

export const readEditor = (editor: HTMLDivElement, layerId: string): EditorContent => {
  if (!hasParagraphBlocks(editor)) {
    return { content: normalizeText(editor), richContent: cleanRichHtml(editor.innerHTML) };
  }
  const { html, listStyles } = serializeParagraphEditor(editor);
  queueTextExtras(layerId, { listStyles });
  const richContent = cleanRichHtml(html);
  return { content: stripZeroWidth(htmlToPlainText(richContent)), richContent };
};
