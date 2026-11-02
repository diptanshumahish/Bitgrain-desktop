import type React from "react";
import { applyToSelection, selectionStyleSignal } from "./text-edit-bus";
import { nextBoldWeight } from "./bold-weight";
import { toggleDecoration, type DecorationKind } from "./text-decoration";

const DECORATION_KEYS: Record<string, DecorationKind> = { u: "underline", x: "strike" };

const toggleSelectionDecoration = (kind: DecorationKind): void => {
  const style = selectionStyleSignal.value;
  const current = { underline: style?.underline.value === true, strike: style?.strike.value === true };
  applyToSelection("textDecorationLine", toggleDecoration(current, kind));
};

const runShortcut = (key: string, shift: boolean): boolean => {
  const style = selectionStyleSignal.value;
  if (key === "b" && !shift) {
    applyToSelection("fontWeight", nextBoldWeight(style?.fontWeight.value ?? null));
    return true;
  }
  if (key === "i" && !shift) {
    applyToSelection("fontStyle", style?.italic.value === true ? "normal" : "italic");
    return true;
  }
  const decoration = DECORATION_KEYS[key];
  if (!decoration || (decoration === "strike") !== shift) return false;
  toggleSelectionDecoration(decoration);
  return true;
};

export function handleFormatShortcut(event: React.KeyboardEvent): boolean {
  if (!(event.metaKey || event.ctrlKey) || event.altKey) return false;
  const handled = runShortcut(event.key.toLowerCase(), event.shiftKey);
  if (handled) {
    event.preventDefault();
    event.stopPropagation();
  }
  return handled;
}
