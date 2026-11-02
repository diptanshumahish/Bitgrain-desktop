import type { TextLayer } from "../../../model/studio-types";
import { cleanRichHtml } from "../../rich-text/rich-text-apply";
import { offsetsToRange, rangeToOffsets } from "../../rich-text/range-offsets";
import { buildParagraphHtml } from "./paragraph-html";
import { hasParagraphBlocks } from "./paragraph-serialize";

const currentRange = (editor: HTMLElement): Range | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  return editor.contains(range.commonAncestorContainer) ? range : null;
};

const restoreRange = (range: Range): void => {
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

export const ensureParagraphBlocks = (
  editor: HTMLElement,
  layer: Pick<TextLayer, "listStyles">,
  range: Range | null = currentRange(editor),
): Range | null => {
  if (hasParagraphBlocks(editor)) return range;
  const offsets = range ? rangeToOffsets(editor, range) : null;
  editor.innerHTML = buildParagraphHtml(cleanRichHtml(editor.innerHTML), layer);
  if (!offsets) return null;
  const restored = offsetsToRange(editor, offsets);
  if (document.activeElement === editor) restoreRange(restored);
  return restored;
};
