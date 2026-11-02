import { useEffect } from "react";
import { undoHistory, redoHistory } from "../../../state/history-store";
import { trackEvent } from "@bitgrain/platform/tracker";
import { runZoomShortcut } from "./zoom-shortcuts";

const EDITABLE_SELECTOR = "input, textarea, [contenteditable]";

const isInEditableField = (event: KeyboardEvent): boolean =>
  !!(event.target as HTMLElement | null)?.closest(EDITABLE_SELECTOR);

const runHistoryShortcut = (event: KeyboardEvent, action: "undo" | "redo"): void => {
  event.preventDefault();
  if (action === "redo") redoHistory();
  else undoHistory();
  trackEvent("home", `${action}_triggered`, { details: { source: "keyboard" } });
};

const handleKeyDown = (event: KeyboardEvent): void => {
  if (!(event.metaKey || event.ctrlKey) || isInEditableField(event)) return;
  if (runZoomShortcut(event)) return;
  if (event.code === "KeyZ") runHistoryShortcut(event, event.shiftKey ? "redo" : "undo");
  else if (event.code === "KeyY") runHistoryShortcut(event, "redo");
};

export const useEditorShortcuts = (): void => {
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);
};
