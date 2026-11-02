import type { TextLayer } from "../../../model/studio-types";
import type { TextListStyle } from "../../../model/text-layout-types";
import { activeEditorTarget, commitActiveEditor } from "../../rich-text/text-edit-bus";
import { ensureParagraphBlocks } from "./editor-paragraphs";
import { refreshParagraphMarkers } from "./paragraph-serialize";

const PARAGRAPH_SELECTOR = ":scope > [data-para]";

const targetBlocks = (editor: HTMLElement, range: Range | null): HTMLElement[] => {
  const blocks = Array.from(editor.querySelectorAll<HTMLElement>(PARAGRAPH_SELECTOR));
  if (!range) return blocks;
  const touched = blocks.filter((block) => range.intersectsNode(block));
  return touched.length ? touched : blocks;
};

export const toggleListInEditor = (style: TextListStyle, layer: Pick<TextLayer, "listStyles">): boolean => {
  const target = activeEditorTarget();
  if (!target) return false;
  const range = ensureParagraphBlocks(target.editorEl, layer, target.range);
  const blocks = targetBlocks(target.editorEl, range);
  const removing = blocks.every((block) => block.dataset.list === style);
  blocks.forEach((block) => {
    if (removing) delete block.dataset.list;
    else block.dataset.list = style;
  });
  refreshParagraphMarkers(target.editorEl);
  commitActiveEditor();
  return true;
};

export const toggleListForLayer = (style: TextListStyle, current: TextListStyle[], count: number): TextListStyle[] => {
  const styles = Array.from({ length: count }, (_, index) => current[index] ?? "none");
  const removing = styles.every((value) => value === style);
  return styles.map(() => (removing ? "none" : style));
};
