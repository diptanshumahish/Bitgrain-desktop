import type { ReactNode } from "react";
import { signal } from "../lib/signal";

// The right side of the title bar shows the active document's contextual actions
// (export, share, present). Every surface stays mounted, so actions are keyed by
// tab id and the title bar renders only the entry for the currently active tab.
// A surface publishes under its own tab id whenever its state changes and clears
// on unmount — no active-gating and no set/clear races between mounted surfaces.
export const titlebarActionsSignal = signal<Record<string, ReactNode>>({});

export const setTitlebarActions = (tabId: string, node: ReactNode): void => {
  titlebarActionsSignal.value = { ...titlebarActionsSignal.value, [tabId]: node };
};

export const clearTitlebarActions = (tabId: string): void => {
  if (!(tabId in titlebarActionsSignal.value)) return;
  const next = { ...titlebarActionsSignal.value };
  delete next[tabId];
  titlebarActionsSignal.value = next;
};
