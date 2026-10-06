import { signal } from "../../../lib/signal";
import type {
  BaseTextStyle,
  ResolvedTextStyle,
  RichStyleProp,
} from "./rich-text-types";
import { resolveRangeStyle } from "./rich-text-read";
import {
  applyPendingStyle,
  applyStyleToRange,
  recolorSubset,
} from "./rich-text-apply";

export const selectionStyleSignal = signal<ResolvedTextStyle | null>(null);
export const highlightRectsSignal = signal<DOMRect[] | null>(null);

interface ActiveEditor {
  editorEl: HTMLElement;
  base: BaseTextStyle;
  commit: () => void;
}

let active: ActiveEditor | null = null;
let savedRange: Range | null = null;

export const registerEditor = (editor: ActiveEditor): void => {
  active = editor;
  refreshSelection();
};

export const unregisterEditor = (editorEl: HTMLElement): void => {
  if (active?.editorEl !== editorEl) return;
  active = null;
  savedRange = null;
  selectionStyleSignal.value = null;
  highlightRectsSignal.value = null;
};

export const showSavedHighlight = (): void => {
  highlightRectsSignal.value =
    active && savedRange && !savedRange.collapsed
      ? Array.from(savedRange.getClientRects())
      : null;
};

export const clearHighlight = (): void => {
  highlightRectsSignal.value = null;
};

export const updateEditorBase = (editorEl: HTMLElement, base: BaseTextStyle): void => {
  if (active?.editorEl === editorEl) active.base = base;
};

const isEditorFocused = (): boolean =>
  !!active && document.activeElement === active.editorEl;

export const refreshSelection = (): void => {
  if (!active || !isEditorFocused()) return;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return;
  const range = selection.getRangeAt(0);
  if (!active.editorEl.contains(range.commonAncestorContainer)) return;
  savedRange = range.cloneRange();
  selectionStyleSignal.value = resolveRangeStyle(active.editorEl, range, active.base);
  highlightRectsSignal.value = null;
};

const liveRange = (): Range | null => {
  if (!active || !isEditorFocused()) return null;
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) return null;
  const range = selection.getRangeAt(0);
  return active.editorEl.contains(range.commonAncestorContainer) ? range : null;
};

const restoreSelection = (range: Range): void => {
  if (!active) return;
  active.editorEl.focus();
  const selection = window.getSelection();
  selection?.removeAllRanges();
  selection?.addRange(range);
};

const publish = (range: Range): void => {
  if (!active) return;
  savedRange = range.cloneRange();
  selectionStyleSignal.value = resolveRangeStyle(active.editorEl, range, active.base);
  if (!isEditorFocused()) showSavedHighlight();
};

const applyPending = (prop: RichStyleProp, value: string, caret: Range): void => {
  if (!active) return;
  restoreSelection(caret);
  applyPendingStyle(prop, value);
  active.commit();
  refreshSelection();
};

export const applyToSelection = (prop: RichStyleProp, value: string): void => {
  if (!active) return;
  const focused = liveRange();
  const range = focused ?? savedRange;
  if (!range) return;
  if (range.collapsed) {
    applyPending(prop, value, range);
    return;
  }
  const next = applyStyleToRange(active.editorEl, range.cloneRange(), prop, value);
  if (!next) return;
  if (focused) restoreSelection(next);
  active.commit();
  publish(next);
};

export const recolorSelectionSubset = (fromHex: string, toHex: string): void => {
  if (!active) return;
  const range = liveRange() ?? savedRange;
  if (!range || range.collapsed) return;
  const next = recolorSubset(active.editorEl, range.cloneRange(), fromHex, toHex, active.base);
  if (!next) return;
  active.commit();
  publish(next);
};

export const setSelectionColor = (hex: string): void =>
  applyToSelection("color", hex);
